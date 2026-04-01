<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Director Dashboard</h1>
      <button @click="fetchCandidates"
        class="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors duration-200">
        Refresh
      </button>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-sm text-red-600"><span class="font-semibold">Error:</span> {{ error }}</p>
    </div>
    <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <p class="text-sm text-green-600">{{ success }}</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow p-4 text-center">
        <div class="text-2xl font-bold text-slate-800">{{ candidates.length }}</div>
        <div class="text-sm text-slate-500">Total Candidates</div>
      </div>
      <div class="bg-white rounded-xl shadow p-4 text-center">
        <div class="text-2xl font-bold text-green-600">{{ statusCounts.Hired || 0 }}</div>
        <div class="text-sm text-slate-500">Hired</div>
      </div>
      <div class="bg-white rounded-xl shadow p-4 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ statusCounts.Offer || 0 }}</div>
        <div class="text-sm text-slate-500">In Offer</div>
      </div>
      <div class="bg-white rounded-xl shadow p-4 text-center">
        <div class="text-2xl font-bold text-red-600">{{ statusCounts.Rejected || 0 }}</div>
        <div class="text-sm text-slate-500">Rejected</div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">All Candidates — Final Review</h2>
      <div v-if="loading" class="text-slate-500 text-center py-8">Loading candidates...</div>
      <div v-else-if="candidates.length === 0" class="text-slate-500 text-center py-8">No candidates found.</div>
      <div v-else class="space-y-2">
        <div class="grid grid-cols-5 gap-4 px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
          <div>Name</div><div>Email</div><div>Position</div><div>Status</div><div>Requisition</div>
        </div>
        <CandidateDetail v-for="c in candidates" :key="c.Id"
          :candidate="c"
          :status-options="directorStatusOptions"
          comment-role="Director"
          :show-rating="false"
          @status-change="updateStatus" />
      </div>
    </div>
  </div>
</template>

<script>
import CandidateDetail from '../components/CandidateDetail.vue'

export default {
  name: "DirectorPage",
  components: { CandidateDetail },
  data() {
    return {
      candidates: [],
      loading: false,
      error: null,
      success: null,
      directorStatusOptions: ['Offer', 'Hired', 'Rejected']
    }
  },
  computed: {
    statusCounts() {
      const counts = {}
      for (const c of this.candidates) {
        counts[c.Status] = (counts[c.Status] || 0) + 1
      }
      return counts
    }
  },
  async mounted() {
    await this.fetchCandidates()
  },
  methods: {
    async fetchCandidates() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch("/api/get-candidates")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        this.candidates = data.candidates || []
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async updateStatus(candidate) {
      try {
        const res = await fetch("/api/update-candidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: candidate.Id, status: candidate.Status })
        })
        if (!res.ok) throw new Error("Failed to update status")
        this.success = "Status updated — decision locked"
      } catch (err) {
        this.error = err.message
      }
    }
  }
}
</script>
