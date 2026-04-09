<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Hiring Manager Dashboard</h1>
      <button @click="refresh"
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

    <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
      <label class="block text-sm font-medium text-slate-700 mb-2">Select Requisition</label>
      <select v-model="selectedRequisitionId" @change="fetchCandidatesForRequisition"
        class="w-full md:w-96 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
        <option value="">-- Select a requisition --</option>
        <option v-for="r in requisitions" :key="r.Id" :value="r.Id">
          {{ r.Title }} ({{ r.Department || 'No dept' }}) - {{ r.Status }}
        </option>
      </select>
    </div>

    <div v-if="selectedRequisitionId" class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">
        Candidates for {{ selectedRequisition.Title }}
      </h2>
      <div v-if="loading" class="text-slate-500 text-center py-8">Loading candidates...</div>
      <div v-else-if="candidates.length === 0" class="text-slate-500 text-center py-8">
        No candidates assigned to this requisition yet.
      </div>
      <div v-else class="space-y-2">
        <div class="grid grid-cols-5 gap-4 px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
          <div>Name</div><div>Email</div><div>Position</div><div>Status</div><div>Requisition</div>
        </div>
        <CandidateDetail v-for="c in candidates" :key="c.Id"
          :candidate="c"
          :status-options="hmStatusOptions"
          comment-role="HiringManager"
          :show-rating="false"
          @status-change="updateStatus" />
      </div>
    </div>

    <div v-else class="text-slate-500 text-center py-12">
      Select a requisition above to view and evaluate candidates.
    </div>
  </div>
</template>

<script>
import CandidateDetail from '../components/CandidateDetail.vue'

export default {
  name: "HiringManagerPage",
  components: { CandidateDetail },
  data() {
    return {
      requisitions: [],
      candidates: [],
      selectedRequisitionId: "",
      loading: false,
      error: null,
      success: null,
      hmStatusOptions: ['Interview', 'Selected', 'Rejected'],
      apiBase: import.meta.env.VITE_API_URL || ""
    }
  },
  computed: {
    selectedRequisition() {
      return this.requisitions.find(r => r.Id == this.selectedRequisitionId) || {}
    }
  },
  async mounted() {
    await this.fetchRequisitions()
  },
  methods: {
    async refresh() {
      await this.fetchRequisitions()
      if (this.selectedRequisitionId) {
        await this.fetchCandidatesForRequisition()
      }
    },
    async fetchRequisitions() {
      try {
        const res = await fetch(this.apiBase + "/api/requisitions?status=Open")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        this.requisitions = data.requisitions || []
      } catch (err) {
        this.error = err.message
      }
    },
    async fetchCandidatesForRequisition() {
      if (!this.selectedRequisitionId) return
      this.loading = true
      this.error = null
      try {
        const res = await fetch(this.apiBase + "/api/candidates-by-requisition?requisitionId=" + this.selectedRequisitionId)
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
        const res = await fetch(this.apiBase + "/api/update-candidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: candidate.Id, status: candidate.Status })
        })
        if (!res.ok) throw new Error("Failed to update status")
        this.success = "Status updated"
      } catch (err) {
        this.error = err.message
      }
    }
  }
}
</script>
