<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-slate-900 mb-8 text-center">
        Recruitment Dashboard
      </h1>

      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-sm text-red-600">
          <span class="font-semibold">Error:</span> {{ error }}
        </p>
      </div>

      <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p class="text-sm text-green-600">{{ success }}</p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 class="text-xl font-semibold text-slate-800 mb-4">Add Candidate</h2>
        <form @submit.prevent="createCandidate" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input v-model="form.firstName" placeholder="First Name *" required
            class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input v-model="form.lastName" placeholder="Last Name *" required
            class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input v-model="form.email" type="email" placeholder="Email *" required
            class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input v-model="form.phone" placeholder="Phone"
            class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input v-model="form.position" placeholder="Position"
            class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea v-model="form.notes" placeholder="Notes" rows="2"
            class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"></textarea>
          <div class="md:col-span-2 flex gap-3">
            <button type="submit" :disabled="submitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50">
              {{ submitting ? 'Saving...' : 'Add Candidate' }}
            </button>
          </div>
        </form>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-slate-800">Candidates</h2>
          <button @click="fetchCandidates"
            class="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors duration-200">
            Refresh
          </button>
        </div>

        <div v-if="loading" class="text-slate-500 text-center py-8">Loading candidates...</div>

        <div v-else-if="candidates.length === 0" class="text-slate-500 text-center py-8">
          No candidates yet. Add one above.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-left">
                <th class="pb-2 pr-4 text-slate-600 font-medium">Name</th>
                <th class="pb-2 pr-4 text-slate-600 font-medium">Email</th>
                <th class="pb-2 pr-4 text-slate-600 font-medium">Phone</th>
                <th class="pb-2 pr-4 text-slate-600 font-medium">Position</th>
                <th class="pb-2 pr-4 text-slate-600 font-medium">Status</th>
                <th class="pb-2 text-slate-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in candidates" :key="c.Id" class="border-b border-slate-100 hover:bg-slate-50">
                <td class="py-3 pr-4 font-medium text-slate-800">{{ c.FirstName }} {{ c.LastName }}</td>
                <td class="py-3 pr-4 text-slate-600">{{ c.Email }}</td>
                <td class="py-3 pr-4 text-slate-600">{{ c.Phone || '—' }}</td>
                <td class="py-3 pr-4 text-slate-600">{{ c.Position || '—' }}</td>
                <td class="py-3 pr-4">
                  <select v-model="c.Status" @change="updateStatus(c)"
                    class="text-xs px-2 py-1 border border-slate-200 rounded bg-white">
                    <option>Applied</option>
                    <option>Screening</option>
                    <option>Interview</option>
                    <option>Offer</option>
                    <option>Hired</option>
                    <option>Rejected</option>
                  </select>
                </td>
                <td class="py-3">
                  <button @click="deleteCandidate(c.Id)"
                    class="text-xs text-red-600 hover:text-red-800 font-medium">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      candidates: [],
      loading: false,
      submitting: false,
      error: null,
      success: null,
      form: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        position: "",
        notes: ""
      }
    };
  },
  async mounted() {
    await this.fetchCandidates();
  },
  methods: {
    async fetchCandidates() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch("/api/get-candidates");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        this.candidates = data.candidates || [];
      } catch (err) {
        this.error = err.message;
        console.error("Fetch error:", err);
      } finally {
        this.loading = false;
      }
    },
    async createCandidate() {
      this.submitting = true;
      this.error = null;
      this.success = null;
      try {
        const response = await fetch("/api/create-candidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form)
        });
        if (!response.ok) {
          const text = await response.text();
          try {
            const data = JSON.parse(text);
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
          } catch {
            throw new Error(`HTTP error! status: ${response.status} - ${text.substring(0, 100)}`);
          }
        }
        this.success = "Candidate added successfully!";
        this.form = { firstName: "", lastName: "", email: "", phone: "", position: "", notes: "" };
        await this.fetchCandidates();
      } catch (err) {
        this.error = err.message;
        console.error("Create error:", err);
      } finally {
        this.submitting = false;
      }
    },
    async updateStatus(candidate) {
      try {
        const response = await fetch("/api/update-candidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: candidate.Id, status: candidate.Status })
        });
        if (!response.ok) throw new Error("Failed to update status");
        this.success = "Status updated";
      } catch (err) {
        this.error = err.message;
        console.error("Update error:", err);
      }
    },
    async deleteCandidate(id) {
      if (!confirm("Are you sure you want to delete this candidate?")) return;
      try {
        const response = await fetch(`/api/delete-candidate?id=${id}`, { method: "POST" });
        if (!response.ok) throw new Error("Failed to delete candidate");
        this.success = "Candidate deleted";
        await this.fetchCandidates();
      } catch (err) {
        this.error = err.message;
        console.error("Delete error:", err);
      }
    }
  }
};
</script>
