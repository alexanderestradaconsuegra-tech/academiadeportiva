const { createCanvas } = require('canvas')
const fs = require('fs')

function genIcon(size) {
  const c = createCanvas(size, size)
  const ctx = c.getContext('2d')
  const r = size * 0.18
  ctx.fillStyle = '#0B5CFF'
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, r)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${size * 0.55}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('⚽', size/2, size/2 + size*0.04)
  return c.toBuffer('image/png')
}
