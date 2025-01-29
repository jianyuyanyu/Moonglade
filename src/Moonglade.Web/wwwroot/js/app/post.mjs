﻿import { callApi } from './httpService.mjs'
import { formatUtcTime, parseMetaContent } from './utils.module.mjs';
import { resetCaptchaImage, showCaptcha } from './captchaService.mjs';
import { calculateReadingTime } from './post.readingtime.mjs';
import { cleanupLocalStorage, recordPostView } from './postview.mjs';

function resizeImages() {
    const images = document.querySelectorAll('.post-content img');
    images.forEach(img => {
        img.removeAttribute('height');
        img.removeAttribute('width');
        img.classList.add('img-fluid', 'img-thumbnail');
    });
}

function renderCodeHighlighter() {
    const pres = document.querySelectorAll('pre');
    pres.forEach(pre => {
        // Find <pre> that doesn't have a <code> inside it.
        if (!pre.querySelector('code')) {
            const code = document.createElement('code');
            while (pre.firstChild) {
                code.appendChild(pre.firstChild);
            }
            pre.appendChild(code);
        }

        // For code that can't be automatically detected, fall back to use XML
        if (pre.classList.contains('language-markup')) {
            pre.querySelector('code').classList.add('lang-xml');
        }
    });

    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        hljs.highlightElement(block);
    });
}

function renderLaTeX() {
    const codeBlocks = document.querySelectorAll('pre.language-latex code');
    codeBlocks.forEach(block => {
        const latex = block.textContent.trim();
        const container = document.createElement('div');
        try {
            katex.render(latex, container, { output: 'mathml' });
            block.parentNode.replaceWith(container);
        } catch (error) {
            console.error(error);
        }
    });
}

function getImageWidthInDevicePixelRatio(width) {
    if (width <= 0) return 0;
    var dpr = window.devicePixelRatio;
    if (dpr === 1) return width;
    return width / dpr;
}

function applyImageZooming() {
    const fitImageToDevicePixelRatio = parseMetaContent("image-device-dpi");

    document.querySelectorAll('.post-content img').forEach(function (img) {
        img.addEventListener('click', function (e) {
            var src = img.getAttribute('src');
            document.querySelector('#imgzoom').src = src;

            if (fitImageToDevicePixelRatio) {
                setTimeout(function () {
                    var w = document.querySelector('#imgzoom').naturalWidth;
                    document.querySelector('#imgzoom').style.width = getImageWidthInDevicePixelRatio(w) + 'px';
                }, 100);
            }

            var imgzoomModal = new bootstrap.Modal(document.querySelector('#imgzoomModal'));
            imgzoomModal.show();
        });
    });
}

function submitComment(pid) {
    const thxForComment = document.querySelector('#thx-for-comment');
    const thxForCommentNonReview = document.querySelector('#thx-for-comment-non-review');
    const loadingIndicator = document.querySelector('#loadingIndicator');
    const btnSubmitComment = document.querySelector('#btn-submit-comment');
    const commentForm = document.querySelector('#comment-form');

    const username = document.querySelector('#input-comment-name').value;
    const content = document.querySelector('#input-comment-content').value;
    const email = document.querySelector('#input-comment-email').value;
    const captchaCode = document.querySelector('#input-comment-captcha').value;

    thxForComment.style.display = 'none';
    thxForCommentNonReview.style.display = 'none';
    loadingIndicator.style.display = 'block';
    btnSubmitComment.classList.add('disabled');
    btnSubmitComment.setAttribute('disabled', 'disabled');

    callApi(
        `/api/comment/${pid}`,
        'POST',
        { username, content, email, captchaCode },
        (success) => {
            commentForm.reset();
            resetCaptchaImage();

            const { status: httpCode } = success;
            if (httpCode === 201) {
                thxForComment.style.display = 'block';
            } else if (httpCode === 200) {
                thxForCommentNonReview.style.display = 'block';
            }
        },
        (always) => {
            loadingIndicator.style.display = 'none';
            btnSubmitComment.classList.remove('disabled');
            btnSubmitComment.removeAttribute('disabled');
        },
        //(error) => {
        //    console.error('Error submitting comment:', error);
        //    // Optionally handle specific error cases
        //}
    );
}

document.addEventListener('DOMContentLoaded', () => {
    resizeImages();
    if (window.innerWidth >= 768) {
        applyImageZooming();
    }

    renderCodeHighlighter();
    renderLaTeX();

    const blogContent = document.querySelector('.post-content').innerText;
    let roundedReadingTime = calculateReadingTime(blogContent);
    document.getElementById('reading-time').innerText = `Estimated Reading Time: ${roundedReadingTime} minute(s)`;

    let pid = document.querySelector('article').dataset.postid;

    if (parseMetaContent('post-is-published')) {
        document.getElementById('comment-form')?.addEventListener('submit', function (e) {
            e.preventDefault();
            submitComment(pid);
        });

        document.getElementById('input-comment-content')?.addEventListener('focus', function () {
            showCaptcha();
        });

        document.getElementById('img-captcha')?.addEventListener('click', function () {
            resetCaptchaImage();
        });

        formatUtcTime();
    }

    cleanupLocalStorage();
    recordPostView(pid);
});
