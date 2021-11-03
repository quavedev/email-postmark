/* global Package */

import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import postmark from 'postmark';
// eslint-disable-next-line import/no-unresolved
import { getSettings } from 'meteor/quave:settings';

const PACKAGE_NAME = 'quave:email-postmark';
const settings = getSettings({ packageName: PACKAGE_NAME });

if (!settings || !settings.apiToken) {
  throw new Meteor.Error(
    'email-postmark: Settings are missing, at least "apiToken" and "from" are required.'
  );
}

const client = new postmark.ServerClient(settings.apiToken);

export const sendEmail = async (options) => {
  const from = options.from || settings.from;
  if (!from) {
    throw new Meteor.Error(
      'email-postmark: Inform a global "from" in the settings or on each call'
    );
  }
  console.log("options.htmlBody", options.htmlBody);
  return client.sendEmail({
    From: from,
    To: options.to,
    Cc: options.cc,
    Bcc: options.bcc,
    Subject: options.subject,
    Tag: options.tag,
    HtmlBody: options.htmlBody,
    ReplyTo: options.replyTo,
    MessageStream: 'outbound',
    TrackOpens: true,
    TrackLinks: "HtmlAndText",
    Attachments: options.attachments,
    Headers: [
      {
        Name: "Message-ID",
        Value: options.messageId
      },
      {
        Name: "In-Reply-To",
        Value: options.inReplyTo
      },
      {
        Name: "References",
        Value: options.references.toString()
      }
    ]
  });
};

Email.customTransport = options => {
  sendEmail(options)
    .then(() => {
      if (settings.isVerbose) {
        // eslint-disable-next-line no-console
        console.log(`Email sent to ${to}`);
      }
    })
    .catch(error => {
      if (Package['quave:logs']) {
        Package['quave:logs'].logger.error({
          message: `email-postmark: Error sending email to ${to}`,
          error,
        });
        return;
      }
      console.error(`email-postmark: Error sending email to ${to}`, error);
    });
};
