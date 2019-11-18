const triggerMouseEvent = (element, eventName) => {
      element.dispatchEvent(new MouseEvent(eventName, {
        view: window,
        bubbles: true,
        cancelable: true
      }));
    };
    
    const remixSVG = document.querySelector('svg'),
          trash = remixSVG.querySelector('#trash');
    
    const trashMatrix = trash.transform.baseVal.getItem(0).matrix;
    const trashBBox = trash.getBBox();
    
    const trashActiveColor = "blue",
          trashInactiveColor = "black";
    
    let selectedPart, offset, transform;
    let trashTimeout;
    
  const getMousePosition = ({ clientX, clientY }) => {
    const CTM = remixSVG.getScreenCTM();
    return { x: (clientX - CTM.e) / CTM.a, y: (clientY - CTM.f) / CTM.d }
  }
  
  const isMouseInTrash = ({ x, y }) =>{
    return y >= trashMatrix.f && y <= trashMatrix.f + trashBBox.height && x >= trashMatrix.e && x <= trashMatrix.e + trashBBox.width;
  }
  
  const mouseDownHandler = (e) => {

    if(e.target.matches('svg') || e.target.parentElement.matches('g.static') || e.target.matches('.static')) return; // ensure items with class static aren't draggable
    
    selectedPart = e.target.parentElement.matches('g') ? 
                      e.target.parentElement : e.target;
    offset = getMousePosition(e);
    
    const transforms = selectedPart.transform.baseVal;
    if (transforms.length === 0 ||
        transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
          const translate = remixSVG.createSVGTransform();
          translate.setTranslate(0,0);
          selectedPart.transform.baseVal.insertItemBefore(translate, 0);
    }
    
    transform = transforms.getItem(0);
    offset.x -= transform.matrix.e;
    offset.y -= transform.matrix.f;
  }
  
  const mouseMoveHandler = (e) => {
    if(selectedPart) {
      e.preventDefault();
      
      const coords = getMousePosition(e);
      transform.setTranslate(coords.x - offset.x, coords.y - offset.y);
      trash.style.visibility = "visible";
      
      if(isMouseInTrash(coords)) {        
        trash.style.fill = trashActiveColor;
        
        if(!trashTimeout) {
          trashTimeout = setTimeout(() => {
            selectedPart.remove(); // remove element when it goes to the trash
            trash.style.fill = trashInactiveColor
            triggerMouseEvent(remixSVG, 'mouseup');
          }, 500);
        }
      }
      else {
        if(trashTimeout){
          clearTimeout(trashTimeout); // remove trash removal timeout if mouse moves out of trash bin
          trashTimeout = undefined;
          trash.style.fill = trashInactiveColor;
        }
      }
    }
  }
  
  const mouseUpHandler = () => {
    selectedPart = undefined;
    trash.style.fill = trashInactiveColor;
    trash.style.visibility = "hidden";
  }
  
  
  
  
  remixSVG.addEventListener('mousedown', mouseDownHandler);
  remixSVG.addEventListener('mousemove', mouseMoveHandler);
  remixSVG.addEventListener('mouseup', mouseUpHandler);
  remixSVG.addEventListener('mouseleave', mouseUpHandler);