import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, Inject, OnInit,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { select, Store } from '@ngrx/store';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import {
  Observable, of, filter, tap, combineLatest, map, switchMap,
  take,
} from 'rxjs';
import { RequiresRolesDirective } from 'app/directives/requires-roles/requires-roles.directive';
import { JobState } from 'app/enums/job-state.enum';
import { Role } from 'app/enums/role.enum';
import { SystemUpdateOperationType, SystemUpdateStatus } from 'app/enums/system-update.enum';
import { observeJob } from 'app/helpers/operators/observe-job.operator';
import { WINDOW } from 'app/helpers/window.helper';
import { helptextGlobal } from 'app/helptext/global-helptext';
import { helptextSystemUpdate as helptext } from 'app/helptext/system/update';
import { ApiJobMethod } from 'app/interfaces/api/api-job-directory.interface';
import { Job } from 'app/interfaces/job.interface';
import { DialogService } from 'app/modules/dialog/dialog.service';
import { IxIconComponent } from 'app/modules/ix-icon/ix-icon.component';
import { selectJob } from 'app/modules/jobs/store/job.selectors';
import { LoaderService } from 'app/modules/loader/loader.service';
import { SnackbarService } from 'app/modules/snackbar/services/snackbar.service';
import { TestDirective } from 'app/modules/test-id/test.directive';
import { ignoreTranslation } from 'app/modules/translate/translate.helper';
import { ApiService } from 'app/modules/websocket/api.service';
import {
  SaveConfigDialog, SaveConfigDialogMessages,
} from 'app/pages/system/advanced/manage-configuration-menu/save-config-dialog/save-config-dialog.component';
import { UpdateType } from 'app/pages/system/update/enums/update-type.enum';
import { Package } from 'app/pages/system/update/interfaces/package.interface';
import { TrainService } from 'app/pages/system/update/services/train.service';
import { UpdateService } from 'app/pages/system/update/services/update.service';
import { updateAgainCode } from 'app/pages/system/update/utils/update-again-code.constant';
import { ErrorHandlerService } from 'app/services/errors/error-handler.service';
import { SystemGeneralService } from 'app/services/system-general.service';
import { AppState } from 'app/store';
import { selectIsHaLicensed } from 'app/store/ha-info/ha-info.selectors';

@UntilDestroy()
@Component({
  selector: 'ix-update-actions-card',
  styleUrls: ['update-actions-card.component.scss'],
  templateUrl: './update-actions-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    IxIconComponent,
    RequiresRolesDirective,
    MatButton,
    TestDirective,
    TranslateModule,
    AsyncPipe,
  ],
})
export class UpdateActionsCardComponent implements OnInit {
  isUpdateRunning = false;
  updateMethod: ApiJobMethod = 'update.update';
  isHaLicensed = false;
  updateType: UpdateType;
  updateTitle = this.translate.instant('Update');
  updateText = computed(() => {
    if (this.isHaLicensed) {
      return this.translate.instant(helptextGlobal.sysUpdateMessage);
    }
    return [
      this.translate.instant(helptextGlobal.sysUpdateMessage),
      this.translate.instant(helptextGlobal.sysUpdateMessagePt2),
    ].join(' ');
  });

  showApplyPendingButton$ = combineLatest([
    this.updateService.updateDownloaded$,
    this.updateService.status$,
  ]).pipe(map(([updateDownloaded, status]) => updateDownloaded && status !== SystemUpdateStatus.Unavailable));

  showDownloadUpdateButton$ = this.updateService.updatesAvailable$;

  isDownloadUpdatesButtonDisabled$ = this.updateService.status$.pipe(
    map((status) => status === SystemUpdateStatus.RebootRequired),
  );

  protected readonly requiredRoles = [Role.SystemUpdateWrite];

  private wasConfigurationSaved = false;

  constructor(
    private router: Router,
    private api: ApiService,
    private matDialog: MatDialog,
    private sysGenService: SystemGeneralService,
    private errorHandler: ErrorHandlerService,
    private loader: LoaderService,
    private dialogService: DialogService,
    private translate: TranslateService,
    private store$: Store<AppState>,
    private snackbar: SnackbarService,
    protected trainService: TrainService,
    protected updateService: UpdateService,
    private cdr: ChangeDetectorRef,
    @Inject(WINDOW) private window: Window,
  ) {
    this.sysGenService.updateRunning.pipe(untilDestroyed(this)).subscribe((isUpdating: string) => {
      this.isUpdateRunning = isUpdating === 'true';
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.store$.select(selectIsHaLicensed).pipe(untilDestroyed(this)).subscribe((isLicensed) => {
      this.isHaLicensed = isLicensed;
      if (isLicensed) {
        this.updateMethod = 'failover.upgrade';
      }
      this.cdr.markForCheck();
      this.checkForUpdateRunning();
    });
  }

  checkForUpdateRunning(): void {
    this.api.call('core.get_jobs', [[['method', '=', this.updateMethod], ['state', '=', JobState.Running]]])
      .pipe(untilDestroyed(this)).subscribe({
        next: (jobs) => {
          if (jobs && jobs.length > 0) {
            this.isUpdateRunning = true;
            this.showRunningUpdate(jobs[0].id);
          }
          this.cdr.markForCheck();
        },
        error: (err: unknown) => {
          console.error(err);
        },
      });
  }

  // Shows an update in progress as a job dialog on the update page
  showRunningUpdate(jobId: number): void {
    const job$ = this.store$.pipe(
      select(selectJob(jobId)),
      observeJob(),
    ) as Observable<Job<ApiJobMethod>>;

    this.dialogService.jobDialog(
      job$,
      {
        title: this.updateTitle,
        canMinimize: true,
      },
    )
      .afterClosed()
      .pipe(
        this.errorHandler.withErrorHandler(),
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.router.navigate(['/system-tasks/restart'], { skipLocationChange: true });
      });
  }

  downloadUpdate(): void {
    this.api.call('core.get_jobs', [[['method', '=', this.updateMethod], ['state', '=', JobState.Running]]])
      .pipe(this.errorHandler.withErrorHandler(), untilDestroyed(this))
      .subscribe((jobs) => {
        if (jobs[0]) {
          this.showRunningUpdate(jobs[0].id);
        } else {
          this.startUpdate();
        }
        this.cdr.markForCheck();
      });
  }

  applyPendingUpdate(): void {
    this.updateType = UpdateType.ApplyPending;
    this.saveConfigurationIfNecessary()
      .pipe(untilDestroyed(this))
      .subscribe(() => this.continueUpdate());
  }

  manualUpdate(): void {
    this.updateType = UpdateType.Manual;
    this.saveConfigurationIfNecessary()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.router.navigate(['/system/update/manualupdate']);
      });
  }

  startUpdate(): void {
    this.updateService.error$.next(false);
    this.api.call('update.check_available').pipe(this.loader.withLoader(), untilDestroyed(this)).subscribe({
      next: (update) => {
        this.updateService.status$.next(update.status);
        if (update.status === SystemUpdateStatus.Available) {
          const packages: Package[] = [];
          update.changes.forEach((change) => {
            if (change.operation === SystemUpdateOperationType.Upgrade) {
              packages.push({
                operation: 'Upgrade',
                name: change.old.name + '-' + change.old.version
                  + ' -> ' + change.new.name + '-'
                  + change.new.version,
              });
            } else if (change.operation === SystemUpdateOperationType.Install) {
              packages.push({
                operation: 'Install',
                name: change.new.name + '-' + change.new.version,
              });
            } else if (change.operation === SystemUpdateOperationType.Delete) {
              if (change.old) {
                packages.push({
                  operation: 'Delete',
                  name: change.old.name + '-' + change.old.version,
                });
              } else if (change.new) {
                packages.push({
                  operation: 'Delete',
                  name: change.new.name + '-' + change.new.version,
                });
              }
            } else {
              console.error('Unknown operation:', change.operation);
            }
          });
          this.updateService.packages$.next(packages);

          if (update.changelog) {
            this.updateService.changeLog$.next(update.changelog.replace(/\n/g, '<br>'));
          }
          if (update.release_notes_url) {
            this.updateService.releaseNotesUrl$.next(update.release_notes_url);
          }
          this.updateType = UpdateType.Standard;
          this.saveConfigurationIfNecessary()
            .pipe(untilDestroyed(this))
            .subscribe(() => this.confirmAndUpdate());
        } else if (update.status === SystemUpdateStatus.Unavailable) {
          this.snackbar.success(this.translate.instant('No updates available.'));
        }
      },
      error: (error: unknown) => {
        this.errorHandler.showErrorModal(error);
      },
      complete: () => {
        this.loader.close();
        this.cdr.markForCheck();
      },
    });
  }

  // Continues the update process began in startUpdate(), after passing through the Save Config dialog
  confirmAndUpdate(): void {
    let downloadMsg;
    let confirmMsg;

    if (!this.isHaLicensed) {
      downloadMsg = helptext.non_ha_download_msg;
      confirmMsg = helptext.non_ha_confirm_msg;
    } else {
      downloadMsg = helptext.ha_download_msg;
      confirmMsg = helptext.ha_confirm_msg;
    }

    this.dialogService.confirm({
      title: this.translate.instant('Download Update'),
      message: this.translate.instant(downloadMsg),
      hideCheckbox: true,
      buttonText: this.translate.instant('Download'),
      secondaryCheckbox: true,
      secondaryCheckboxText: this.translate.instant(confirmMsg),
    })
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (!result.confirmed) {
          return;
        }

        if (!result.secondaryCheckbox) {
          this.downloadUpdates();
        } else {
          this.update();
        }
      });
  }

  private finishHaUpdate(): Observable<boolean> {
    return this.dialogService.confirm({
      title: this.translate.instant(helptext.ha_update.complete_title),
      message: this.translate.instant(helptext.ha_update.complete_msg),
      buttonText: this.translate.instant(helptext.ha_update.complete_action),
      hideCheckbox: true,
      hideCancel: true,
    });
  }

  private finishNonHaUpdate(): Observable<boolean> {
    return this.dialogService.confirm({
      title: this.translate.instant(helptext.ha_update.complete_title),
      message: this.translate.instant('Update completed successfully. The system will restart shortly'),
      buttonText: this.translate.instant(helptext.ha_update.complete_action),
      hideCheckbox: true,
      hideCancel: true,
    });
  }

  private update(resume = false): void {
    this.window.sessionStorage.removeItem('updateLastChecked');
    this.window.sessionStorage.removeItem('updateAvailable');
    this.sysGenService.updateRunningNoticeSent.emit();

    let job$: Observable<Job>;
    if (this.isHaLicensed) {
      job$ = this.trainService.trainValue$.pipe(
        take(1),
        switchMap((trainValue) => this.api.call('update.set_train', [trainValue])),
        switchMap(() => this.api.job('failover.upgrade', [{ resume }])),
      );
    } else {
      job$ = this.api.job('update.update', [{ resume, reboot: true }]);
    }

    this.dialogService
      .jobDialog(job$, { title: this.translate.instant(this.updateTitle) })
      .afterClosed()
      .pipe(
        switchMap(() => {
          this.dialogService.closeAllDialogs();
          this.isUpdateRunning = false;
          this.sysGenService.updateDone(); // Send 'finished' signal to topbar
          this.cdr.markForCheck();
          return this.isHaLicensed ? this.finishHaUpdate() : this.finishNonHaUpdate();
        }),
        this.errorHandler.withErrorHandler(),
        untilDestroyed(this),
      )
      .subscribe();
  }

  // Continues the update (based on its type) after the Save Config dialog is closed
  continueUpdate(): void {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (this.updateType) {
      case UpdateType.ApplyPending: {
        const message = this.isHaLicensed
          ? this.translate.instant('The standby controller will be automatically restarted to finalize the update. Apply updates and restart the standby controller?')
          : this.translate.instant('The system will restart and be briefly unavailable while applying updates. Apply updates and restart?');
        this.dialogService.confirm({
          title: this.translate.instant('Apply Pending Updates'),
          message: this.translate.instant(message),
        }).pipe(filter(Boolean), untilDestroyed(this)).subscribe(() => {
          this.update();
        });
        break;
      }
      case UpdateType.Standard:
        this.confirmAndUpdate();
    }
  }

  private saveConfigurationIfNecessary(): Observable<unknown> {
    if (this.wasConfigurationSaved) {
      return of(null);
    }

    return this.matDialog.open(SaveConfigDialog, {
      data: {
        title: this.translate.instant('Save configuration settings from this machine before updating?'),
        saveButton: this.translate.instant('Save Configuration'),
        cancelButton: this.translate.instant('Do not save'),
      } as Partial<SaveConfigDialogMessages>,
    })
      .afterClosed()
      .pipe(
        tap((wasSaved) => {
          if (wasSaved) {
            this.wasConfigurationSaved = true;
          }
        }),
      );
  }

  private handleUpdateError(error: Job): void {
    if (error.error?.includes(updateAgainCode)) {
      this.dialogService.confirm({
        title: this.translate.instant(helptext.continueDialogTitle),
        message: ignoreTranslation(error.error.replace(updateAgainCode, '')),
        buttonText: this.translate.instant(helptext.continueDialogAction),
      }).pipe(
        filter(Boolean),
        untilDestroyed(this),
      ).subscribe(() => {
        this.update(true);
      });
      return;
    }
    this.errorHandler.showErrorModal(error);
  }

  private downloadUpdates(): void {
    this.dialogService.jobDialog(
      this.api.job('update.download'),
      { title: this.updateTitle },
    )
      .afterClosed()
      .pipe(
        this.errorHandler.withErrorHandler(),
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.snackbar.success(this.translate.instant('Updates successfully downloaded'));
        this.updateService.pendingUpdates();
      });
  }
}
