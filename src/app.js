const socket = io()

$('#form1').submit(function (e) {
  e.preventDefault()
  const i1 = document.getElementById('nodeName')
  const i2 = document.getElementById('connectPort')
  socket.emit('join', i1.value, i2.value, (res) => {
    console.log(res);
    $('#status').text(`Status: ${res}`)
    if (res == "Connected"){
      $('#connect').prop('disabled', true)
      $('#mine').prop('disabled', false)
    }
  })
})
$('#form2').submit(function (e) {
  e.preventDefault()
  socket.emit('mine', (res) => {
    console.log(res)
  })
  socket.on('mine_data', (data, fn) => {
    console.log(data, fn)
    $('#msg').append(document.createTextNode(data.data))
    console.log("HERE")
    fn("AALLOO SEND NUDES")
  })
  $('#mine').prop('disabled', true)
  $('#text').css('visibility', 'visible')
})
