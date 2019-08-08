const { SITE_DOMAIN } = process.env;

module.exports = {
  inviteUser(blockstackId, inviteId, creator, groupName) {
    return `
Hi <b>${blockstackId}</b>,

<b>${creator}</b> has invited you to join the user group <b>${groupName}</b>. Click <b><a href="${SITE_DOMAIN}/group-invite/${inviteId}">here</a></b> to activate your membership.

Thanks,
The Blocksnacks Team
    `;
  }
}