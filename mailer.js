const sendgrid = require('@sendgrid/mail');
const templates = require('./email-templates');

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  inviteUser(recipient, { blockstackId, inviteId, creator, groupName }) {
    const html = templates.inviteUser(blockstackId, inviteId, creator, groupName);
    const email = {
      to: recipient,
      from: 'do-not-reply@blocksnacks.edu',
      subject: 'Invitation to Blocksnack User Group',
      html,
    };
    return sendgrid.send(email);
  }
};
