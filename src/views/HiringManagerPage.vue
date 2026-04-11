<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-2xl font-bold text-slate-900">Hiring Manager Workflow & Dashboard</h1>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Hiring Manager
              </span>
            </div>
            <p class="text-sm text-slate-500">Review and manage candidates for your requisitions</p>
          </div>
          <button @click="refresh" :disabled="loading"
            class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
            <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ loading ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>

      <div v-if="success" class="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-emerald-700">{{ success }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Open Requisitions" :value="requisitions.length" subtitle="Active positions" icon="chart" variant="success" highlight accentColor="#10b981" />
        <StatCard label="Total Candidates" :value="totalCandidates" subtitle="Across all reqs" icon="users" variant="default" />
        <StatCard label="In Interview" :value="interviewCount" subtitle="Under evaluation" icon="offer" variant="warning" highlight accentColor="#f59e0b" />
      </div>

      <div class="bg-white rounded-xl shadow-card p-6 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-slate-700 mb-2">Select a Requisition to Review</label>
            <select v-model="selectedRequisitionId" @change="fetchCandidatesForRequisition"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white">
              <option value="">-- Select a requisition --</option>
              <option v-for="r in requisitions" :key="r.Id" :value="r.Id">
                {{ r.Title }} ({{ r.Department || 'No dept' }}) - {{ r.Status }}
              </option>
            </select>
          </div>
          <div v-if="selectedRequisitionId" class="flex items-center gap-2 text-sm text-slate-600">
            <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{{ candidates.length }} candidate{{ candidates.length !== 1 ? 's' : '' }} in pipeline</span>
          </div>
        </div>
      </div>

      <div v-if="selectedRequisitionId" class="bg-white rounded-xl shadow-card overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Candidates</h2>
              <p class="text-sm text-slate-500">{{ selectedRequisition.Title }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">Filter:</span>
              <select v-model="stageFilter"
                class="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer">
                <option value="">All Stages</option>
                <option v-for="s in hmAccessibleStages" :key="s.stage" :value="s.name">{{ s.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="loading" class="p-12 text-center">
          <svg class="w-8 h-8 mx-auto text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-4 text-sm text-slate-500">Loading candidates...</p>
        </div>

        <div v-else-if="filteredCandidates.length === 0" class="p-12 text-center">
          <svg class="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="text-slate-600 font-medium">No candidates found</p>
          <p class="text-sm text-slate-400 mt-1">No candidates match the selected filter</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div v-for="candidate in filteredCandidates" :key="candidate.Id"
            class="px-6 py-4 hover:bg-slate-50 transition-colors duration-150">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {{ getInitials(candidate.FirstName, candidate.LastName) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-slate-900 truncate">{{ candidate.FirstName }} {{ candidate.LastName }}</p>
                    <p class="text-xs text-slate-500 truncate">{{ candidate.Email }}</p>
                  </div>
                </div>
              </div>
                <div class="hidden sm:flex items-center gap-6 ml-4">
                  <div class="text-right min-w-0">
                    <p class="text-sm text-slate-900 truncate">{{ candidate.Position || '--' }}</p>
                    <p class="text-xs text-slate-400">Applied {{ formatDate(candidate.CreatedAt) }}</p>
                  </div>
                  <div class="flex-shrink-0">
                    <StatusBadge :status="candidate.StageName || candidate.Status" />
                  </div>
                  <div class="flex-shrink-0">
                    <button @click="toggleExpand(candidate.Id)"
                      class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200">
                      <svg class="w-5 h-5 transition-transform duration-200" :class="{ 'rotate-180': expandedId === candidate.Id }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
            </div>

            <div v-if="expandedId === candidate.Id" class="mt-4 pt-4 border-t border-gray-100">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-slate-50 rounded-xl p-4">
                  <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Candidate Details</h4>
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-500">Phone</span>
                      <span class="text-slate-900 font-medium">{{ candidate.Phone || '--' }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-500">Position</span>
                      <span class="text-slate-900 font-medium">{{ candidate.Position || '--' }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-500">Stage</span>
                      <span class="text-slate-900 font-medium">{{ candidate.StageName || 'Applied' }}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm pt-2 mt-2 border-t border-slate-200">
                      <span class="text-slate-500">Move to Stage</span>
                      <select v-model="candidate.nextStage" @change="transitionStage(candidate)"
                        class="text-xs px-2 py-1 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer">
                        <option value="">Select stage...</option>
                        <option v-for="s in getNextStages(candidate.Stage)" :key="s.stage" :value="s.stage">{{ s.name }}</option>
                      </select>
                    </div>
                    <div v-if="candidate.Notes" class="pt-2 mt-2 border-t border-slate-200">
                      <span class="text-slate-500 text-xs block mb-1">Notes</span>
                      <p class="text-sm text-slate-700">{{ candidate.Notes }}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Your Evaluation</h4>
                  <CommentList :candidate-id="candidate.Id" :requisition-id="candidate.RequisitionId" role="HiringManager" :show-add-form="true" :show-rating="false" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-card p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="text-lg font-semibold text-slate-700 mb-2">Select a Requisition</h3>
        <p class="text-sm text-slate-500">Choose a requisition from the dropdown above to view and evaluate candidates</p>
      </div>
    </div>
  </div>
</template>

<script>
import StatCard from '../components/StatCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import CommentList from '../components/CommentList.vue'

export default {
  name: "HiringManagerPage",
  components: { StatCard, StatusBadge, CommentList },
  data() {
    return {
      requisitions: [],
      candidates: [],
      stages: [],
      selectedRequisitionId: "",
      loading: false,
      error: null,
      success: null,
      stageFilter: '',
      expandedId: null,
      apiBase: import.meta.env.VITE_API_URL || "",
      currentUser: 'Hiring Manager',
      currentRole: 'HiringManager'
    }
  },
  computed: {
    selectedRequisition() {
      return this.requisitions.find(r => r.Id == this.selectedRequisitionId) || {}
    },
    totalCandidates() {
      return this.candidates.length
    },
    interviewCount() {
      return this.candidates.filter(c => c.StageName === 'Technical Interview').length
    },
    hmAccessibleStages() {
      return this.stages.filter(s => s.permission && s.permission.roles && s.permission.roles.includes('HiringManager'))
    },
    filteredCandidates() {
      if (!this.stageFilter) return this.candidates
      return this.candidates.filter(c => (c.StageName || 'Applied') === this.stageFilter)
    }
  },
  async mounted() {
    await Promise.all([this.fetchRequisitions(), this.fetchStages()])
  },
  methods: {
    async refresh() {
      await this.fetchRequisitions()
      await this.fetchStages()
      if (this.selectedRequisitionId) {
        await this.fetchCandidatesForRequisition()
      }
    },
    async fetchStages() {
      try {
        const res = await fetch(this.apiBase + "/api/get-stages")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        this.stages = data.stages || []
      } catch (err) {
        console.error("Fetch stages error:", err)
      }
    },
    async fetchRequisitions() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(this.apiBase + "/api/requisitions?status=Open")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        this.requisitions = data.requisitions || []
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async fetchCandidatesForRequisition() {
      if (!this.selectedRequisitionId) return
      this.loading = true
      this.error = null
      this.stageFilter = ''
      this.expandedId = null
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
    async silentFetchCandidatesForRequisition() {
      if (!this.selectedRequisitionId) return
      try {
        const res = await fetch(this.apiBase + "/api/candidates-by-requisition?requisitionId=" + this.selectedRequisitionId)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        this.candidates = data.candidates || []
      } catch (err) {
        console.error("Silent fetch candidates error:", err)
      }
    },
    getNextStages(currentStage) {
      const stageNum = typeof currentStage === 'string' ? this.getStageNumFromName(currentStage) : (currentStage || 1)
      const currentStageName = this.stages.find(s => s.stage === stageNum)?.name || 'Applied'
      const stage = this.stages.find(s => s.name === currentStageName)
      if (!stage || !stage.permission || !stage.permission.roles.includes('HiringManager')) {
        return []
      }
      return stage.permission.nextStages.map(num => ({
        stage: num,
        name: this.stages.find(s => s.stage === num)?.name || `Stage ${num}`
      }))
    },
    getStageNumFromName(name) {
      const stage = this.stages.find(s => s.name === name)
      return stage ? stage.stage : 1
    },
    async transitionStage(candidate) {
      if (!candidate.nextStage) return
      try {
        const res = await fetch(this.apiBase + "/api/stage-transition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateId: candidate.Id,
            toStage: parseInt(candidate.nextStage),
            role: this.currentRole,
            changedBy: this.currentUser,
            notes: `Moved to ${candidate.nextStage}`
          })
        })
        const data = await res.json()
        if (!res.ok) {
          this.error = data.error || 'Failed to transition stage'
          candidate.nextStage = ''
          return
        }
        this.success = `Candidate moved to ${data.toStageName}`
        candidate.Stage = data.toStage
        candidate.StageName = data.toStageName
        candidate.Status = data.toStage
        candidate.nextStage = ''
        await this.silentFetchCandidatesForRequisition()
      } catch (err) {
        this.error = err.message
        candidate.nextStage = ''
      }
    },
    toggleExpand(id) {
      this.expandedId = this.expandedId === id ? null : id
    },
    getInitials(firstName, lastName) {
      return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase()
    },
    formatDate(dateStr) {
      if (!dateStr) return "--"
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }
}
</script>
