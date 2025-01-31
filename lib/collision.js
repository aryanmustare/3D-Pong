(() => {
    const hasCollision = (element, target) => {
      const rect = element.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      
      return !(
        rect.right <= targetRect.left ||
        rect.left >= targetRect.right ||
        rect.bottom <= targetRect.top ||
        rect.top >= targetRect.bottom
      );
    };
  
    $.fn.collidesWith = function(elements) {
      const $collection = $([]);
      const $targets = $(elements);
      
      this.each((i, element) => {
        $targets.each((j, target) => {
          if (element !== target && hasCollision(element, target)) {
            $collection.push(target);
          }
        });
      });
      
      return $collection;
    };
  })(jQuery);