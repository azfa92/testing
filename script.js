document.addEventListener("DOMContentLoaded", function () {
  let transaksi = JSON.parse(localStorage.getItem("dataTransaksi")) || [];
  let editIndex = -1; // -1 berarti mode 'tambah', angka lain berarti indeks item yang diedit

  // Mengambil referensi elemen-elemen DOM
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

  // --- Event Listener untuk Submit Form ---
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Mencegah reload halaman saat form disubmit

    const tanggal = tanggalInput.value;
    const keterangan = keteranganInput.value;
    // Menggunakan parseFloat agar bisa menerima nilai desimal
    const masuk = parseFloat(masukInput.value) || 0;
    const keluar = parseFloat(keluarInput.value) || 0;

    // Validasi sederhana: Pastikan tanggal dan keterangan tidak kosong, dan setidaknya ada saldo masuk atau keluar
    if (!tanggal || !keterangan) {
        alert("Tanggal dan Keterangan tidak boleh kosong.");
        return;
    }
    if (masuk === 0 && keluar === 0) {
      alert("Saldo masuk atau saldo keluar tidak boleh kosong keduanya.");
      return; // Hentikan proses jika validasi gagal
    }

    if (editIndex === -1) {
      // Mode Tambah: Tambahkan transaksi baru ke array
      transaksi.push({ tanggal, keterangan, masuk, keluar });
    } else {
      // Mode Edit: Perbarui transaksi yang ada di array
      transaksi[editIndex] = { tanggal, keterangan, masuk, keluar };
      editIndex = -1; // Reset editIndex setelah update selesai
      tombolSubmit.textContent = "Tambah"; // Kembalikan teks tombol ke "Tambah"
    }

    simpanKeLocalStorage(); // Simpan data transaksi terbaru ke localStorage
    form.reset(); // Kosongkan form setelah submit
    renderTransaksi(); // Render ulang tabel untuk menampilkan perubahan terbaru
  });

  // --- Fungsi untuk Merender (Menampilkan) Transaksi di Tabel ---
  function renderTransaksi() {
    tbody.innerHTML = ""; // Kosongkan isi tabel sebelum diisi ulang
    let totalMasuk = 0;
    let totalKeluar = 0;

    // Loop melalui setiap item transaksi dan buat baris tabel
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

    // --- Atur Event Listener untuk Tombol Edit dan Hapus setelah Dirender ---
    // Penting: Event listener harus ditambahkan setelah elemen tombol dibuat dan ditambahkan ke DOM
    // Memindahkan penanganan event ini di luar forEach, menggunakan event delegation
    // agar event listener tidak ditambahkan berulang kali
    attachButtonListeners(); // Panggil fungsi untuk melampirkan listener
    
    // Perbarui tampilan ringkasan saldo
    totalMasukElement.textContent = "Saldo Masuk: Rp " + totalMasuk.toLocaleString("id-ID");
    totalKeluarElement.textContent = "Saldo Keluar: Rp " + totalKeluar.toLocaleString("id-ID");
    sisaSaldoElement.textContent = "Sisa Saldo: Rp " + (totalMasuk - totalKeluar).toLocaleString("id-ID");
  }

  // --- Fungsi untuk Melampirkan Event Listener ke Tombol Edit dan Hapus ---
  // Menggunakan event delegation pada tbody untuk performa yang lebih baik
  function attachButtonListeners() {
      tbody.removeEventListener("click", handleTableButtonClick); // Hapus listener lama jika ada
      tbody.addEventListener("click", handleTableButtonClick); // Tambahkan listener baru
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

  // --- Fungsi untuk Mengisi Form saat Tombol Edit Diklik ---
  function editTransaksi(index) {
    const item = transaksi[index];
    tanggalInput.value = item.tanggal;
    keteranganInput.value = item.keterangan;
    masukInput.value = item.masuk;
    keluarInput.value = item.keluar;
    editIndex = index; // Set editIndex untuk menandai bahwa kita sedang dalam mode edit
    tombolSubmit.textContent = "Update"; // Ubah teks tombol menjadi "Update"
  }

  // --- Fungsi untuk Menghapus Transaksi ---
  function hapusTransaksi(index) {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
      transaksi.splice(index, 1); // Hapus 1 elemen dari array di posisi 'index'
      simpanKeLocalStorage(); // Simpan perubahan ke localStorage
      renderTransaksi(); // Render ulang tabel untuk mencerminkan penghapusan

      // Jika item yang dihapus adalah item yang sedang diedit, reset form
      if (editIndex === index) {
        form.reset();
        editIndex = -1; // Reset mode edit
        tombolSubmit.textContent = "Tambah"; // Kembalikan teks tombol
      } else if (editIndex > index) {
        // Jika item yang diedit berada setelah item yang dihapus, sesuaikan editIndex
        editIndex--;
      }
    }
  }

  // --- Fungsi untuk Menyimpan Data ke Local Storage ---
  function simpanKeLocalStorage() {
    localStorage.setItem("dataTransaksi", JSON.stringify(transaksi));
  }

  // --- Fungsi Logout ---
  // Fungsi ini dideklarasikan sebagai properti window agar bisa dipanggil langsung dari onclick di HTML
  window.logout = function () {
    if (confirm("Yakin ingin logout?")) {
      // Anda bisa menambahkan logika logout di sini, seperti membersihkan sesi atau token
      alert("Anda telah logout."); // Contoh notifikasi
      window.location.href = "index.html"; // Arahkan ke halaman login Anda
    }
  };

  // --- Panggil renderTransaksi() saat halaman pertama kali dimuat ---
  // Ini akan memuat data dari localStorage dan menampilkannya di tabel
  renderTransaksi();
});
