import EXIF from 'exif-js'

export default{
  getOrientation: (file) => {
    return new Promise((resolve) => {
      EXIF.getData(file, function () {
        const orient = EXIF.getTag(this, 'Orientation')
        resolve(orient)
      })
    })
  },
  dataURLtoFile: (dataurl, filename) => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
  },
  rotateImage: (image, width, height, orient) => {
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    ctx.save()
    canvas.width = width
    canvas.height = height
    console.log(orient);
    ctx.drawImage(image, 0, 0);
    // if(orient == 8) { //顺时针90°
    //   ctx.rotate(270 * Math.PI / 180)
    //   ctx.drawImage(image, -width, 0);
    // }else if(orient == 6){ //逆时针90°
    //   ctx.rotate(90 * Math.PI / 180)
    //   ctx.drawImage(image, 0, -height)
    // }else if(orient == 3){ // 旋转180°
    //   ctx.rotate(180 * Math.PI / 180)
    //   ctx.drawImage(image, -width, -height)
    // }
    ctx.restore()
    return canvas.toDataURL("image/jpeg")
  }
}
