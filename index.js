$(document).ready(function () {
    const html = localStorage.getItem('bookingSummaryModalHtml');
    if (html) {
        localStorage.removeItem('bookingSummaryModalHtml'); // Clean up
        showBookingSummaryAfterReload(html);
        return;
    }

    function showBookingSummaryAfterReload(html) {
        let $modal = $('#booking-summary-modal');
        if ($modal.length === 0) {
            $modal = $('<div id="booking-summary-modal" style="display:none;position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.65);overflow:auto;"></div>');
            $('body').append($modal);
        }
        $modal.html('<div style="position:relative;max-width:600px;margin:40px auto;background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);padding:32px 24px;">' +
            '<button id="close-booking-summary" style="position:absolute;top:12px;right:18px;font-size:1.5em;background:none;border:none;cursor:pointer;">&times;</button>' +
            html + '</div>');
        $modal.fadeIn(200);
        $('#close-booking-summary').on('click', function () {
            $modal.fadeOut(200);
            location.reload(); // Reload the page to reset the state
        });
    }
});