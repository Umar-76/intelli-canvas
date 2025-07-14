// client/src/utils/exportUtils.ts
export const exportAsPNG = (stageRef: React.RefObject<Konva.Stage>) => {
  if (!stageRef.current) return;
  
  const dataURL = stageRef.current.toDataURL({
    mimeType: 'image/png',
    quality: 1.0,
    pixelRatio: 2
  });
  
  const link = document.createElement('a');
  link.download = 'whiteboard.png';
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportAsPDF = (stageRef: React.RefObject<Konva.Stage>) => {
  // Similar implementation using jsPDF library
};