
async function upload() {
  const file = document.getElementById("file").files[0]
  const fd = new FormData()
  fd.append("file", file)

  const res = await fetch("http://localhost:8000/upload", {
    method: "POST",
    body: fd
  })

  const data = await res.json()
  document.getElementById("out").innerText =
    JSON.stringify(data, null, 2)
}
