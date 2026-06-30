class DPad {
  constructor() {
    this.focusables = [];
    this.currentIndex = -1;
    this.init();
  }

  init() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.updateFocusables();
    
    // Auto focus first element
    if(this.focusables.length > 0) {
      this.focus(0);
    }
  }

  updateFocusables() {
    this.focusables = Array.from(document.querySelectorAll('.focusable'));
    if (this.currentIndex >= this.focusables.length) {
      this.currentIndex = 0;
    }
    
    // Add mouseenter listener for magic remote support
    this.focusables.forEach((el, index) => {
        if (!el.dataset.mouseLinked) {
            el.dataset.mouseLinked = "true";
            el.addEventListener('mouseenter', () => {
                if (this.currentIndex !== index) {
                    this.focus(index);
                }
            });
            el.addEventListener('mouseleave', () => {
                if (this.currentIndex === index) {
                    el.classList.remove('focused');
                    this.currentIndex = -1;
                }
            });
        }
    });
  }

  handleKeyDown(e) {
    const key = e.key || e.keyCode;
    
    // LG webOS color buttons and standard keys
    const isEnter = key === 'Enter' || key === 13;
    const isBack = key === 'Back' || key === 'BrowserBack' || key === 461 || key === 8 || key === 27;
    const isRed = key === 'Red' || key === 'ColorF0Red' || key === 403;
    const isGreen = key === 'Green' || key === 'ColorF1Green' || key === 404;
    const isYellow = key === 'Yellow' || key === 'ColorF2Yellow' || key === 405;
    const isBlue = key === 'Blue' || key === 'ColorF3Blue' || key === 406;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 38, 40, 37, 39].includes(key)) {
      const activeEl = document.activeElement;
      const isInputActive = activeEl && (activeEl.tagName.toLowerCase() === 'input' || activeEl.tagName.toLowerCase() === 'textarea');
      
      // If we're inside an input, don't prevent default for Left/Right so cursor can move
      if (isInputActive && (key === 'ArrowLeft' || key === 37 || key === 'ArrowRight' || key === 39)) {
          return; // Let the input handle it
      }
      
      e.preventDefault();
      
      // If we press Up/Down while in an input, blur it so we can navigate
      if (isInputActive && (key === 'ArrowUp' || key === 38 || key === 'ArrowDown' || key === 40)) {
          activeEl.blur();
      }
      
      this.navigate(key);
    } else if (isEnter) {
      if(this.currentIndex > -1 && this.focusables[this.currentIndex]) {
        const el = this.focusables[this.currentIndex];
        const input = el.querySelector('input');
        
        if (input) {
            // It's an input group, focus the input to open virtual keyboard
            input.focus();
            input.click(); // webOS sometimes needs a click event to trigger VK
        } else if (el.tagName.toLowerCase() === 'input') {
            // Already an input
            el.focus();
            el.click();
        } else {
            // Normal button or element
            e.preventDefault();
            el.click();
        }
      }
    } else if (isRed) {
       document.dispatchEvent(new CustomEvent('tvRedButton'));
    } else if (isGreen) {
       document.dispatchEvent(new CustomEvent('tvGreenButton'));
    } else if (isYellow) {
       document.dispatchEvent(new CustomEvent('tvYellowButton'));
    } else if (isBlue) {
       document.dispatchEvent(new CustomEvent('tvBlueButton'));
    } else if (isBack) {
       document.dispatchEvent(new CustomEvent('tvBackButton'));
    }
  }

  navigate(key) {
    if (this.focusables.length === 0) return;
    
    const currentElement = this.focusables[this.currentIndex];
    if (!currentElement) {
      this.focus(0);
      return;
    }
    
    const currentRect = currentElement.getBoundingClientRect();
    let bestMatch = -1;
    let minDistance = Infinity;

    this.focusables.forEach((el, index) => {
      if (index === this.currentIndex) return;
      const rect = el.getBoundingClientRect();
      
      let isCandidate = false;
      let distance = 0;

      if ((key === 'ArrowRight' || key === 39) && rect.left >= currentRect.right - 10) {
        isCandidate = true;
        distance = Math.abs(rect.top - currentRect.top) + (rect.left - currentRect.right);
      } else if ((key === 'ArrowLeft' || key === 37) && rect.right <= currentRect.left + 10) {
        isCandidate = true;
        distance = Math.abs(rect.top - currentRect.top) + (currentRect.left - rect.right);
      } else if ((key === 'ArrowDown' || key === 40) && rect.top >= currentRect.bottom - 10) {
        isCandidate = true;
        distance = Math.abs(rect.left - currentRect.left) + (rect.top - currentRect.bottom);
      } else if ((key === 'ArrowUp' || key === 38) && rect.bottom <= currentRect.top + 10) {
        isCandidate = true;
        distance = Math.abs(rect.left - currentRect.left) + (currentRect.top - rect.bottom);
      }

      if (isCandidate && distance < minDistance) {
        minDistance = distance;
        bestMatch = index;
      }
    });

    if (bestMatch > -1) {
      this.focus(bestMatch);
    }
  }

  focus(index) {
    if(this.currentIndex > -1 && this.focusables[this.currentIndex]) {
      this.focusables[this.currentIndex].classList.remove('focused');
    }
    this.currentIndex = index;
    const el = this.focusables[this.currentIndex];
    if(el) {
      el.classList.add('focused');
      el.focus();
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.dpad = new DPad();
});
