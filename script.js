document.addEventListener("DOMContentLoaded", function () {
  let transaksi = [];
  let editIndex = -1;

  const API_URL = "https://saldo-api.azfa92.repl.co";
  const form = document.getElementById("formTransaksi");
  const tanggalInput = document.getElementById("tanggal");
  const keteranganInput = document.getElementById("keterangan");
  const masukInput = document.getElementById("masuk");
  const keluarInput = document.getElementById("keluar");
  const tombolSubmit = document.getElementById("submitButton");
  const tbody = document.getElementById("tabelRiwayat");
  const totalMasukElement = document.getElementById("totalMasuk");
  const totalKeluarElement = document.getElementById("totalKeluar");
  const sisaSaldoElement = document.getElementById("sisaSaldo");

  fetch(`${API_URL}/get-saldo`)
    .then(res => res.json())
    .then(data => {
      transaksi = data.transaksi || [];
      renderTransaksi();
    });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const tanggal = tanggalInput.value;
    const keterangan = keteranganInput.value;
    const masuk = parseFloat(masukInput.value) || 0;
    const keluar = parseFloat(keluarInput.value) || 0;

    if (!tanggal || !keterangan) {
      alert("Tanggal dan Keterangan tidak boleh kosong.");
      return;
    }
    if (masuk === 0 && keluar === 0) {
      alert("Saldo masuk atau keluar tidak boleh kosong dua-duanya.");
      return;
    }

    if (editIndex === -1) {
      transaksi.push({ tanggal, keterangan, masuk, keluar });
    } else {
      transaksi[editIndex] = { tanggal, keterangan, masuk, keluar };
      editIndex = -1;
      tombolSubmit.textContent = "Tambah";
    }

    simpanKeBackend();
    form.reset();
    renderTransaksi();
  });

  function renderTransaksi() {
    tbody.innerHTML = "";
    let totalMasuk = 0;
    let totalKeluar = 0;

    transaksi.forEach((item, index) => {
      totalMasuk += item.masuk;
      totalKeluar += item.keluar;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.tanggal}</td>
        <td>${item.keterangan}</td>
        <td>${item.masuk ? "Rp " + item.masuk.toLocaleString("id-ID") : "-"}</td>
        <td>${item.keluar ? "Rp " + item.keluar.toLocaleString("id-ID") : "-"}</td>
        <td>
          <button class="edit-btn" data-index="${index}">Edit</button>
          <button class="hapus-btn" data-index="${index}">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    attachButtonListeners();
    totalMasukElement.textContent = "Saldo Masuk: Rp " + totalMasuk.toLocaleString("id-ID");
    totalKeluarElement.textContent = "Saldo Keluar: Rp " + totalKeluar.toLocaleString("id-ID");
    sisaSaldoElement.textContent = "Sisa Saldo: Rp " + (totalMasuk - totalKeluar).toLocaleString("id-ID");
  }

  function attachButtonListeners() {
    tbody.removeEventListener("click", handleTableButtonClick);
    tbody.addEventListener("click", handleTableButtonClick);
  }

  function handleTableButtonClick(event) {
    const target = event.target;
    if (target.classList.contains("edit-btn")) {
      const index = parseInt(target.getAttribute("data-index"));
      editTransaksi(index);
    } else if (target.classList.contains("hapus-btn")) {
      const index = parseInt(target.getAttribute("data-index"));
      hapusTransaksi(index);
    }
  }

  function editTransaksi(index) {
    const item = transaksi[index];
    tanggalInput.value = item.tanggal;
    keteranganInput.value = item.keterangan;
    masukInput.value = item.masuk;
    keluarInput.value = item.keluar;
    editIndex = index;
    tombolSubmit.textContent = "Update";
  }

  function hapusTransaksi(index) {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
      transaksi.splice(index, 1);
      simpanKeBackend();
      renderTransaksi();
      if (editIndex === index) {
        form.reset();
        editIndex = -1;
        tombolSubmit.textContent = "Tambah";
      } else if (editIndex > index) {
        editIndex--;
      }
    }
  }

  function simpanKeBackend() {
    fetch(`${API_URL}/update-saldo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ transaksi })
    })
    .then(res => res.json())
    .then(res => console.log("Disimpan:", res));
  }

  window.logout = function () {
    if (confirm("Yakin ingin logout?")) {
      alert("Anda telah logout.");
      window.location.href = "index.html";
    }
  };
});

