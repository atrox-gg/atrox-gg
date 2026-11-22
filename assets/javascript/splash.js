/* ATROX — one 7-second splash clock; the page content loads underneath it. */
(() => {
  'use strict';

  const splash = document.querySelector('[data-splash]');
  const content = document.getElementById('site-content');
  const progressFill = document.querySelector('[data-splash-progress]');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 7000;
  const fadeDuration = 500;
  const startedAt = Number.isFinite(window.__atroxSplashStartedAt)
    ? window.__atroxSplashStartedAt
    : performance.now();

  if (!document.documentElement.classList.contains('splash-enabled')
      || !splash || !content || !progressFill) {
    document.documentElement.classList.remove('splash-enabled', 'splash-active');
    return;
  }

  content.inert = true;
  content.setAttribute('aria-hidden', 'true');

  let timerId = 0;
  let progressFrameId = 0;
  let isLeaving = false;
  let isFinished = false;

  function elapsedTime() {
    return Math.max(0, performance.now() - startedAt);
  }

  function syncProgress() {
    if (isLeaving || isFinished) return;
    if (progressFrameId) window.cancelAnimationFrame(progressFrameId);

    const elapsed = Math.min(elapsedTime(), duration);
    const remaining = Math.max(0, duration - elapsed);
    const progress = elapsed / duration;

    progressFill.style.transition = 'none';
    progressFill.style.transform = `scaleX(${progress})`;

    if (remaining > 0) {
      progressFrameId = window.requestAnimationFrame(() => {
        progressFrameId = 0;
        if (isLeaving || isFinished) return;
        progressFill.style.transition = `transform ${remaining}ms linear`;
        progressFill.style.transform = 'scaleX(1)';
      });
    }
  }

  function finishSplash() {
    if (isFinished) return;
    isFinished = true;
    if (timerId) window.clearTimeout(timerId);
    if (progressFrameId) window.cancelAnimationFrame(progressFrameId);
    timerId = 0;
    progressFrameId = 0;

    splash.removeEventListener('transitionend', onTransitionEnd);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('pageshow', onPageShow);
    if (typeof motionPreference.removeEventListener === 'function') {
      motionPreference.removeEventListener('change', onMotionPreferenceChange);
    } else if (typeof motionPreference.removeListener === 'function') {
      motionPreference.removeListener(onMotionPreferenceChange);
    }

    splash.hidden = true;
    content.inert = false;
    content.removeAttribute('aria-hidden');
    document.documentElement.classList.remove('splash-active', 'splash-enabled');
  }

  function onTransitionEnd(event) {
    if (event.target === splash && event.propertyName === 'opacity') finishSplash();
  }

  function beginFade() {
    if (isLeaving || isFinished) return;
    const elapsed = elapsedTime();
    const remaining = duration - elapsed;
    if (remaining > 0) {
      scheduleDeadline();
      return;
    }

    const fadeRemaining = Math.max(0, fadeDuration - (elapsed - duration));
    isLeaving = true;
    progressFill.style.transition = 'none';
    progressFill.style.transform = 'scaleX(1)';
    if (progressFrameId) window.cancelAnimationFrame(progressFrameId);
    progressFrameId = 0;

    if (motionPreference.matches || fadeRemaining === 0) {
      finishSplash();
      return;
    }

    splash.style.transitionDuration = `${fadeRemaining}ms`;
    splash.classList.add('is-leaving');
  }

  function scheduleDeadline() {
    if (isLeaving || isFinished) return;
    if (timerId) window.clearTimeout(timerId);
    const remaining = Math.max(0, duration - elapsedTime());
    timerId = window.setTimeout(beginFade, remaining);
  }

  function onVisibilityChange() {
    if (document.hidden || isFinished) return;
    const elapsed = elapsedTime();
    if (isLeaving) {
      if (elapsed >= duration + fadeDuration) finishSplash();
      return;
    }
    if (elapsed >= duration + fadeDuration) {
      finishSplash();
      return;
    }
    if (elapsed >= duration) {
      beginFade();
      return;
    }
    syncProgress();
    scheduleDeadline();
  }

  function onPageHide() {
    if (timerId) window.clearTimeout(timerId);
    if (progressFrameId) window.cancelAnimationFrame(progressFrameId);
    timerId = 0;
    progressFrameId = 0;
  }

  function onPageShow(event) {
    if (!event.persisted || isFinished) return;
    const elapsed = elapsedTime();
    if (elapsed >= duration + fadeDuration) {
      finishSplash();
      return;
    }
    if (isLeaving) return;
    if (elapsed >= duration) {
      beginFade();
      return;
    }
    syncProgress();
    scheduleDeadline();
  }

  function onMotionPreferenceChange(event) {
    if (event.matches && isLeaving) finishSplash();
  }

  splash.addEventListener('transitionend', onTransitionEnd);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', onPageShow);
  if (typeof motionPreference.addEventListener === 'function') {
    motionPreference.addEventListener('change', onMotionPreferenceChange);
  } else if (typeof motionPreference.addListener === 'function') {
    motionPreference.addListener(onMotionPreferenceChange);
  }

  syncProgress();
  scheduleDeadline();
})();
