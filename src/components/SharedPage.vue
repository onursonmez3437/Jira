<template>
  <v-container>
    <h1 class="title">GÜNLÜK HAYAT TAKİP</h1>
    <div style="height: 2rem"></div>

    <div
      style="display: flex; gap: 10px; justify-content: center; margin-bottom: 20px"
    >
      <button class="btn taskfilter" @click="addDialog = true">
        YENİ GÖREV EKLE
      </button>
      <button class="btn taskfilter" @click="activeFilter = 'all'">
        TÜM GÖREVLER
      </button>
      <button class="btn taskfilter" @click="activeFilter = 'active'">
        YAPILACAKLAR / DEVAM EDENLER
      </button>
      <button class="btn taskfilter" @click="activeFilter = 'completed'">
        TAMAMLANANLAR
      </button>
    </div>

    <!-- GÖREV EKLE -->
    <v-dialog v-model="addDialog" max-width="500">
      <v-card>
        <v-card-title style="text-align: center">
          Yeni Günlük Görev
        </v-card-title>

        <v-card-text>
          <v-text-field v-model="newGunluk.title" label="Görev Adı" required />
          <QuillEditor
            v-model:content="newGunluk.detail"
            contentType="html"
            theme="snow"
            :toolbar="toolbarOptions"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" @click="addDialog = false">İptal</v-btn>
          <v-btn color="primary" @click="submitAdd">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- GÖREV GÜNCELLE -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card>
        <v-card-title>Görevi Güncelle</v-card-title>

        <v-card-text>
          <v-text-field
            v-model="editGunluk.title"
            label="Görev Adı"
            required
          />
          <QuillEditor
            v-model:content="editGunluk.detail"
            contentType="html"
            theme="snow"
            :toolbar="toolbarOptions"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" @click="editDialog = false">İptal</v-btn>
          <v-btn color="primary" @click="submitEdit">Güncelle</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- TASK LIST -->
    <div
      class="taskCard"
      v-for="gunluk in filteredGunluks"
      :key="gunluk.id"
      :class="{ completed: gunluk.complate }"
    >
      <div class="taskMain" @click="toggleDetail(gunluk.id)">
        <div class="taskInfo">
          <span class="taskId">#{{ gunluk.id }}</span>
          <span class="taskTitle">{{ gunluk.title }}</span>
          <span class="taskStatus">
            {{ gunluk.complate ? "Tamamlandı" : "Devam Ediyor" }}
          </span>
        </div>

        <div class="taskActions" @click.stop>
          <button class="btn delete" @click="remove(gunluk)">
            GÖREVİ KALDIR
          </button>
          <button class="btn edit" @click="openEdit(gunluk)">
            GÖREVİ GÜNCELLE
          </button>
          <button class="btn change" @click="change(gunluk)">
            DURUMU DEĞİŞTİR
          </button>
        </div>
      </div>

      <div
        v-if="openGunlukId === gunluk.id"
        class="taskDetail"
        v-html="gunluk.detail"
      ></div>
    </div>
  </v-container>
</template>

<script>
export default {
  name: "GunlukHayat",

  data() {
    return {
      toolbarOptions: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["clean"],
      ],
      gunluks: [],
      openGunlukId: null,
      activeFilter: "all",
      addDialog: false,
      editDialog: false,
      newGunluk: { title: "", detail: "", complate: false },
      editGunluk: { id: null, title: "", detail: "" },
    };
  },

  computed: {
    filteredGunluks() {
      if (this.activeFilter === "active") {
        return this.gunluks.filter((g) => !g.complate);
      }
      if (this.activeFilter === "completed") {
        return this.gunluks.filter((g) => g.complate);
      }
      return this.gunluks;
    },
  },

  mounted() {
    this.loadGunluks();
  },

  methods: {
    loadGunluks() {
      fetch("http://localhost:3000/gunlukHayat")
        .then((r) => r.json())
        .then((d) => (this.gunluks = d));
    },

    toggleDetail(id) {
      this.openGunlukId = this.openGunlukId === id ? null : id;
    },

    change(gunluk) {
      fetch(`http://localhost:3000/gunlukHayat/${gunluk.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complate: !gunluk.complate }),
      })
        .then((r) => r.json())
        .then((u) => {
          const i = this.gunluks.findIndex((g) => g.id === u.id);
          if (i !== -1) this.gunluks[i].complate = u.complate;
        });
    },

    submitAdd() {
      if (!this.newGunluk.title || !this.newGunluk.detail) return;

      fetch("http://localhost:3000/gunlukHayat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.newGunluk),
      })
        .then((r) => r.json())
        .then((d) => {
          this.gunluks.push(d);
          this.newGunluk = { title: "", detail: "", complate: false };
          this.addDialog = false;
        });
    },

    remove(gunluk) {
      fetch(`http://localhost:3000/gunlukHayat/${gunluk.id}`, {
        method: "DELETE",
      }).then(() => {
        this.gunluks = this.gunluks.filter((g) => g.id !== gunluk.id);
      });
    },

    openEdit(gunluk) {
      this.editGunluk = { ...gunluk };
      this.editDialog = true;
    },

    submitEdit() {
      fetch(`http://localhost:3000/gunlukHayat/${this.editGunluk.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: this.editGunluk.title,
          detail: this.editGunluk.detail,
        }),
      })
        .then((r) => r.json())
        .then((u) => {
          const i = this.gunluks.findIndex((g) => g.id === u.id);
          if (i !== -1) this.gunluks[i] = u;
          this.editDialog = false;
        });
    },
  },
};
</script>

<style>
.taskMain {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  text-align: center;
  background-color: darkmagenta;
  color: white;
  font-weight: bold;
}
.taskCard {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  margin-bottom: 10px;
  border-radius: 8px;
  background-color: white;
  border: 1px solid #ddd;
  cursor: pointer;
}
.taskCard.completed {
  background-color: #28a745;
  color: white;
}
.taskInfo {
  display: flex;
  gap: 20px;
  align-items: center;
}
.taskId {
  font-weight: bold;
}
.taskStatus {
  font-size: 14px;
}
.taskActions {
  display: flex;
  gap: 8px;
}
.btn {
  border: none;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  color: white;
}
.btn.delete {
  background-color: #dc3545;
}
.btn.edit {
  background-color: #ffc107;
  color: black;
}
.btn.change {
  background-color: darkmagenta;
}
.taskDetail {
  margin-top: 8px;
  font-size: 14px;
}
.btn.taskfilter {
  background-color: maroon;
}
</style>
