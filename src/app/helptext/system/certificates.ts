import { Validators } from '@angular/forms';
import { marker as T } from '@biesbjerg/ngx-translate-extract-marker';

export const helptextSystemCertificates = {
  add: {
    name: {
      tooltip: T('Descriptive identifier for this certificate.'),
      errors: T('Allowed characters: letters, numbers, underscore (_), and dash (-).'),
    },

    csrCreateType: {
      placeholder: T('Type'),
      tooltip: T('<i>Certificate Signing Requests</i> control when an external CA will issue (sign) the certificate. Typically used with ACME or other CAs that most popular browsers trust by default \
 <i>Import Certificate Signing Request</i> lets you import an existing CSR onto the system. Typically used with ACME or internal CAs.'),
    },

    profiles: {
      tooltip: T('Predefined certificate extensions. Choose a profile that best \
matches your certificate usage scenario.'),
    },

    keyType: {
      tooltip: T(
        'See <a href="https://crypto.stackexchange.com/questions/1190/why-is-elliptic-curve-cryptography-not-widely-used-compared-to-rsa" target="blank">\
 Why is elliptic curve cryptography not widely used, compared to RSA?</a>\
 for more information about key types.',
      ),
    },

    ecCurve: {
      tooltip: T(
        'Brainpool curves can be more secure, while secp curves can be faster. See\
 <a href="https://tls.mbed.org/kb/cryptography/elliptic-curve-performance-nist-vs-brainpool" target="blank">\
 Elliptic Curve performance: NIST vs Brainpool\
 </a> for more information.',
      ),
    },

    keyLength: {
      tooltip: T(
        'The number of bits in the key used by the\
 cryptographic algorithm. For security reasons,\
 a minimum key length of <i>2048</i> is recommended.',
      ),
    },

    digestAlgorithm: {
      tooltip: T(
        'The cryptographic algorithm to use. The default\
 <i>SHA256</i> only needs to be changed if the\
 organization requires a different algorithm.',
      ),
    },

    lifetime: {
      placeholder: T('Lifetime'),
      tooltip: T('The lifetime of the CA specified in days.'),
      validation: [Validators.required, Validators.min(0)],
    },

    country: {
      tooltip: T('Select the country of the organization.'),
    },

    state: {
      tooltip: T('Enter the state or province of the organization.'),
    },

    city: {
      tooltip: T(
        'Enter the location of the organization. For example,\
 the city.',
      ),
    },

    organization: {
      tooltip: T('Enter the name of the company or organization.'),
    },

    organizationalUnit: {
      tooltip: T('Organizational unit of the entity.'),
    },

    email: {
      tooltip: T(
        'Enter the email address of the person responsible for\
 the CA.',
      ),
    },

    common: {
      tooltip: T(
        'Enter the <a href="https://kb.iu.edu/d/aiuv"\
 target="_blank">fully-qualified hostname (FQDN)</a> of\
 the system. This name must be unique within a\
 certificate chain.',
      ),
    },

    san: {
      tooltip: T(
        'Multi-domain support. Enter additional domains to \
 secure. Separate domains by pressing <code>Enter</code> \
 For example, if the primary domain is <i>example.com</i>, \
 entering <i>www.example.com</i> secures both addresses.',
      ),
    },

    certificate: {
      tooltip: T('Paste the certificate.'),
    },

    certCsr: {
      tooltip: T('Paste the contents of your Certificate Signing Request here.'),
    },

    privatekey: {
      tooltip: T(
        'Paste the private key associated with the\
 Certificate when available. Please provide\
 a key at least 1024 bits long.',
      ),
    },

    passphrase: {
      tooltip: T('Enter the passphrase for the Private Key.'),
    },

    basicConstraints: {
      config: {
        tooltip: T('Specify whether to use the certificate for a Certificate Authority \
          and whether this extension is critical. Clients must recognize critical extensions \
          to prevent rejection. Web certificates typically require you to disable \
          CA and enable Critical Extension.'),
      },
      ca: {
        placeholder: T('CA'),
        tooltip: T('Identify this certificate as a Certificate Authority (CA).'),
      },
      enabled: {
        tooltip: T('Activate the Basic Constraints extension to identify whether \
          the certificate\'s subject is a CA and the maximum depth of valid \
          certification paths that include this certificate.'),
      },
      pathLength: {
        tooltip: T('How many non-self-issued intermediate certificates that can follow \
this certificate in a valid certification path. Entering <i>0</i> allows a single \
additional certificate to follow in the certificate path. Cannot be less than <i>0</i>.'),
      },
      extensionCritical: {
        placeholder: T('Critical Extension'),
        tooltip: T('Identify this extension as critical for the certificate. Critical extensions must \
be recognized by the certificate-using system or this certificate will be rejected. Extensions \
identified as <i>not</i> critical can be ignored by the certificate-using system and the \
certificate still approved.'),
      },
    },

    extendedKeyUsage: {
      usages: {
        tooltip: T('Identify the purpose for this public key. Typically used for end \
entity certificates. Multiple usages can be selected. Do not mark this extension \
critical when the <i>Usage</i> is <i>ANY_EXTENDED_KEY_USAGE</i>.<br><br> \
Using both <b>Extended Key Usage</b> and <b>Key Usage</b> extensions \
requires that the purpose of the certificate is consistent with both extensions. See \
<a href="https://www.ietf.org/rfc/rfc3280.txt" target="_blank">RFC 3280, section 4.2.1.13</a> \
for more details.'),
      },
      enabled: {
        tooltip: T('Activate this certificate extension.\
The Extended Key Usage extension identifies and limits valid uses for this certificate, such as client authentication or server authentication.\
See <a href="https://www.ietf.org/rfc/rfc3280.txt" target="_blank">RFC 3280, section 4.2.1.13</a> \
for more details.'),
      },
      extensionCritical: {
        placeholder: T('Critical Extension'),
        tooltip: T('Identify this extension as critical for the certificate. Critical extensions must \
be recognized by the certificate-using system or this certificate will be rejected. Extensions \
identified as <i>not</i> critical can be ignored by the certificate-using system and the \
certificate still approved.'),
      },
    },

    keyUsage: {
      config: {
        tooltip: T('Specify this certificate\'s valid Key Usages. Web certificates \
          typically need at least Digital Signature and possibly Key Encipherment \
          or Key Agreement, while other applications may need other usages.'),
      },
      enabled: {
        tooltip: T('Activate this certificate extension.\
  The key usage extension defines the purpose \
 (e.g., encipherment, signature, certificate signing) of the key contained in \
 the certificate. The usage restriction might be employed when a key that \
 could be used for more than one operation is to be restricted. For \
 example, when an RSA key should be used only to verify signatures on \
 objects other than public key certificates and CRLs, the <i>Digital Signature</i> \
 bits would be asserted. Likewise, when an RSA key should be used only for key \
 management, the <i>Key Encipherment</i> bit would be asserted. <br> \
 See <a href="https://www.ietf.org/rfc/rfc3280.txt">RFC 3280, section 4.2.1.3</a> \
 for more information.'),
      },
      digitalSignature: {
        placeholder: T('Digital Signature'),
        tooltip: T('This certificate\'s public key is used with digital signature methods \
that are separate from certificate or CRL signing.'),
      },
      contentCommitment: {
        placeholder: T('Content Commitment'),
        tooltip: T('This certificate\'s public key verifies digital signatures used for a \
non-repudiation service.'),
      },
      key_Encipherment: {
        placeholder: T('Key Encipherment'),
        tooltip: T('This certificate\'s public key is used for key management.'),
      },
      dataEncipherment: {
        placeholder: T('Data Encipherment'),
        tooltip: T('This certificate\'s public key is used to encipher user data.'),
      },
      keyAgreement: {
        placeholder: T('Key Agreement'),
        tooltip: T('This certificate\'s public key is used to manage key agreement.'),
      },
      keyCertSign: {
        placeholder: T('Key Cert Sign'),
        tooltip: T('This certificate\'s public key is used to verify signatures on \
other public key certificates. Activating this also requires enabling the \
<b>CA</b> basic constraint.'),
      },
      crlSign: {
        placeholder: T('CRL Sign'),
        tooltip: T('This certificate\'s public key is used to verify signatures \
on a certificate revocation list (CRL).'),
      },
      encipherOnly: {
        placeholder: T('Encipher Only'),
        tooltip: T('The certificate\'s public key is used to encipher user \
data only during key agreement operations. Requires that \
<b>Key Agreement</b> is also set.'),
      },
      decipherOnly: {
        placeholder: T('Decipher Only'),
        tooltip: T('This certificate\'s public key is used to decipher \
user data only during key agreement operations. Requires that \
<b>Key Agreement</b> is also set.'),
      },
      extensionCritical: {
        placeholder: T('Critical Extension'),
        tooltip: T('Identify this extension as critical for the certificate. Critical extensions must \
be recognized by the certificate-using system or this certificate will be rejected. Extensions \
identified as <i>not</i> critical can be ignored by the certificate-using system and the \
certificate still approved.'),
      },
    },
  },

  edit: {
    name: {
      tooltip: T(
        'Enter an alphanumeric name for the certificate.\
 Underscore (_), and dash (-) characters are allowed.',
      ),
    },
    renewDays: {
      tooltip: T(
        'For example if you set this value to 5, system will renew certificates that expire in 5 days or less.',
      ),
    },
  },

  acme: {
    identifier: {
      tooltip: T('Internal identifier of the certificate. Only\
 alphanumeric characters, dash (<b>-</b>), and underline (<b>_</b>) are\
 allowed.'),
    },
    tos: {
      tooltip: T('Please accept the terms of service for the given ACME\
 Server.'),
    },
    renewDay: {
      tooltip: T('Number of days to renew certificate before expiring.'),
    },
    dirUri: {
      tooltip: T('URI of the ACME Server Directory. Choose a pre configured URI'),
      customCheckboxTooltip: T('Use Custom ACME Server Directory URI'),
      customInputTooltip: T('URI of the ACME Server Directory. Enter a custom URI.'),
    },
    authenticator: {
      tooltip: T('Authenticator to validate the Domain. Choose a\
 previously configured ACME DNS authenticator.'),
    },
  },
};
