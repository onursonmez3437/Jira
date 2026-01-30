<template>
  <v-container>
    <h1 class="title">GÖREV TAKİP UYGULAMASI</h1>
    <div style="height: 2rem"></div>

    <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 20px">
      <button class="btn taskfilter" @click="addDialog = true">YENİ GÖREV EKLE</button>
      <button class="btn taskfilter" @click="activeFilter = 'all'">TÜM GÖREVLER</button>
      <button class="btn taskfilter" @click="activeFilter = 'active'">YAPILACAKLAR / DEVAM EDENLER</button>
      <button class="btn taskfilter" @click="activeFilter = 'completed'">TAMAMLANANLAR</button>
    </div>

    <!-- GÖREV EKLE -->
    <v-dialog v-model="addDialog" max-width="500">
      <v-card>
        <v-card-title style="text-align: center">Yeni Görev Ekle</v-card-title>

        <v-card-text>
          <v-text-field v-model="newTask.title" label="Görev Adı" required />
          <QuillEditor
            v-model:content="newTask.detail"
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
          <v-text-field v-model="editTask.title" label="Görev Adı" required />
          <QuillEditor
            v-model:content="editTask.detail"
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
      v-for="task in filteredTasks"
      :key="task.id"
      :class="{ completed: task.complate }"
    >
      <div class="taskMain" @click="toggleDetail(task.id)">
        <div class="taskInfo">
          <span class="taskId">#{{ task.id }}</span>
          <span class="taskTitle">{{ task.title }}</span>
          <span class="taskStatus">{{ task.complate ? "Tamamlandı" : "Devam Ediyor" }}</span>
        </div>

        <div class="taskActions" @click.stop>
          <button class="btn delete" @click="remove(task)">GÖREVİ KALDIR</button>
          <button class="btn edit" @click="openEdit(task)">GÖREVİ GÜNCELLE</button>
          <button class="btn change" @click="change(task)">DURUMU DEĞİŞTİR</button>
        </div>
      </div>

      <div v-if="openTaskId === task.id" class="taskDetail" v-html="task.detail"></div>
    </div>
  </v-container>
</template>

<script>
export default {
  name: "MyFiles",

  data() {
    return {
      toolbarOptions: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["clean"],
      ],
      tasks: [],
      openTaskId: null,
      activeFilter: "all",
      addDialog: false,
      editDialog: false,
      newTask: { title: "", detail: "", complate: false },
      editTask: { id: null, title: "", detail: "" },
    };
  },

  computed: {
    filteredTasks() {
      if (this.activeFilter === "active") {
        return this.tasks.filter((t) => !t.complate);
      }
      if (this.activeFilter === "completed") {
        return this.tasks.filter((t) => t.complate);
      }
      return this.tasks;
    },
  },

  mounted() {
    this.loadTasks();
  },

  methods: {
    loadTasks() {
      fetch("http://localhost:3000/tasks")
        .then((r) => r.json())
        .then((d) => (this.tasks = d));
    },

    toggleDetail(id) {
      this.openTaskId = this.openTaskId === id ? null : id;
    },

    change(task) {
      fetch(`http://localhost:3000/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complate: !task.complate }),
      })
        .then((r) => r.json())
        .then((u) => {
          const i = this.tasks.findIndex((t) => t.id === u.id);
          if (i !== -1) this.tasks[i].complate = u.complate;
        });
    },

    submitAdd() {
      if (!this.newTask.title || !this.newTask.detail) return;

      fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.newTask),
      })
        .then((r) => r.json())
        .then((d) => {
          this.tasks.push(d);
          this.newTask = { title: "", detail: "", complate: false };
          this.addDialog = false;
        });
    },

    remove(task) {
      fetch(`http://localhost:3000/tasks/${task.id}`, { method: "DELETE" }).then(
        () => (this.tasks = this.tasks.filter((t) => t.id !== task.id))
      );
    },

    openEdit(task) {
      this.editTask = { ...task };
      this.editDialog = true;
    },

    submitEdit() {
      fetch(`http://localhost:3000/tasks/${this.editTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.editTask),
      })
        .then((r) => r.json())
        .then((u) => {
          const i = this.tasks.findIndex((t) => t.id === u.id);
          if (i !== -1) this.tasks[i] = u;
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
  flex-direction: column; /* üst satır ve detay alt alta olacak */
  justify-content: space-between;
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
  align-items: right;
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
  opacity: 0.9;
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
  font-size: 14px;
}
.btn.add {
  background-color: turquoise;
  color: black;
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
  margin-top: 8px; /* üst satırdan boşluk */
  font-size: 14px;
  opacity: 0.9;
  padding-left: 8px; /* biraz içeride göster */
}

.btn.taskfilter {
  background-color: maroon;
}
</style>
