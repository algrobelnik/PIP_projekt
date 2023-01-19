const socket = io()

$('#form1').submit(function (e) {
  e.preventDefault()
  const i1 = document.getElementById('nodeName')
  const i2 = document.getElementById('connectIPPort')
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
  var ul = $('ul#blockChain');
  socket.on('mine_data', (data) => {
    var li = $('<li/>').appendTo(ul);
    var d = new Date(data.timestamp);
    var p = $('<p/>', { text : data.data + " " + d.toString() }).appendTo(li);
  })
  $('#mine').prop('disabled', true)
  $('#text').css('visibility', 'visible')
})
