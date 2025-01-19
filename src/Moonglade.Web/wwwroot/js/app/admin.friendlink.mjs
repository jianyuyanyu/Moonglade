import { success } from './toastService.mjs'

function deleteFriendLink(friendlinkid) {
    callApi(`/api/friendlink/${friendlinkid}`,
        'DELETE',
        {},
        (resp) => {
            document.querySelector(`#tr-${friendlinkid}`).remove();
            success('Friend link deleted');
        });
}

function deleteFriendLinkConfirm(id) {
    var cfm = confirm("Delete Confirmation?");
    if (cfm) deleteFriendLink(id);
}

function handleSubmit(event) {
    event.preventDefault();

    var httpVerb = fid == window.emptyGuid ? 'POST' : 'PUT';
    var apiAddress = fid == window.emptyGuid ? `/api/friendlink` : `/api/friendlink/${fid}`;

    const data = new FormData(event.target);
    const value = Object.fromEntries(data.entries());

    callApi(apiAddress,
        httpVerb,
        {
            id: fid,
            title: value["EditLinkRequest.Title"],
            linkUrl: value["EditLinkRequest.LinkUrl"],
            rank: value["EditLinkRequest.Rank"]
        },
        (resp) => {
            document.querySelector('#edit-form').reset();

            const modalElement = document.getElementById(`editFriendlinkModal`);
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();

            window.location.reload();
        });
}

document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', function () {
        const lid = this.getAttribute('data-linkid');
        deleteFriendLinkConfirm(lid);
    });
});

const form = document.querySelector('#edit-form');
form.addEventListener('submit', handleSubmit);