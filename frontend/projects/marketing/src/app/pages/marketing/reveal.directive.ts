import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';

/**
 * Reveal on scroll for the marketing page's blocks: adds `is-in` once the element enters the
 * viewport so the page's styles fade it in. Purely decorative; when the visitor prefers reduced
 * motion, or the browser has no IntersectionObserver, every block shows at once (L2-095 AC13).
 */
@Directive({ selector: '[mkReveal]', host: { 'data-reveal': '' } })
export class RevealDirective {
  constructor() {
    const element = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced || !('IntersectionObserver' in window)) {
      element.classList.add('is-in');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.classList.add('is-in');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(element);
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}
