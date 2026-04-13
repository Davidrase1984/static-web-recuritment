<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-2xl font-bold text-slate-900">Director Dashboard</h1>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Director View
              </span>
            </div>
            <p class="text-sm text-slate-500">Overview of all recruitment activities and final decisions</p>
          </div>
          <button @click="fetchCandidates" :disabled="loading"
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

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Candidates"
          :value="candidates.length"
          subtitle="All candidates"
          icon="users"
          variant="default"
        />
        <StatCard
          label="Director Review"
          :value="statusCounts['Director Review'] || 0"
          subtitle="Awaiting decision"
          icon="check"
          variant="success"
          highlight
          accentColor="#6366f1"
        />
        <StatCard
          label="Offer Released"
          :value="statusCounts['Offer Released'] || 0"
          subtitle="Awaiting acceptance"
          icon="offer"
          variant="info"
          highlight
          accentColor="#0891b2"
        />
        <StatCard
          label="Offer Accepted"
          :value="statusCounts['Offer Accepted'] || 0"
          subtitle="Successfully placed"
          icon="reject"
          variant="success"
        />
      </div>

      <div class="bg-white rounded-xl shadow-card overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">All Candidates</h2>
              <p class="text-sm text-slate-500">{{ filteredCandidates.length }} candidates in pipeline</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input v-model="searchQuery" type="text" placeholder="Search candidates..."
                  class="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200" />
              </div>
              <select v-model="stageFilter"
                class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer">
                <option value="">All Stages</option>
                <option v-for="s in directorAccessibleStages" :key="s.stage" :value="s.name">{{ s.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="loading" class="p-12 text-center">
          <svg class="w-8 h-8 mx-auto text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
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
          <p class="text-sm text-slate-400 mt-1">Try adjusting your search or filter</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div v-for="candidate in filteredCandidates" :key="candidate.Id"
            class="px-6 py-4 hover:bg-slate-50 transition-colors duration-150">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
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
                    <p class="text-xs text-slate-400">{{ candidate.RequisitionTitle || 'No requisition' }}</p>
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
                      <span class="text-slate-500">Applied</span>
                      <span class="text-slate-900 font-medium">{{ formatDate(candidate.CreatedAt) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-500">Stage</span>
                      <span class="text-slate-900 font-medium">{{ candidate.StageName || 'Applied' }}</span>
                    </div>
                    <div v-if="getNextStages(candidate.Stage).length > 0" class="flex justify-between items-center text-sm pt-2 mt-2 border-t border-slate-200">
                      <span class="text-slate-500">Move to Stage</span>
                      <select v-model="candidate.nextStage" @change="transitionStage(candidate)"
                        class="text-xs px-2 py-1 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
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
                  <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Director Comments</h4>
                  <CommentList
                    :candidate-id="candidate.Id"
                    :requisition-id="candidate.RequisitionId"
                    role="Director"
                    :show-add-form="true"
                    :show-rating="false" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StatCard from '../components/StatCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import CommentList from '../components/CommentList.vue'

export default {
  name: "DirectorPage",
  components: { StatCard, StatusBadge, CommentList },
  data() {
    return {
      candidates: [],
      stages: [],
      loading: false,
      error: null,
      success: null,
      searchQuery: '',
      stageFilter: '',
      expandedId: null,
      apiBase: import.meta.env.VITE_API_URL || "",
      currentUser: 'Director',
      currentRole: 'Director'
    }
  },
  computed: {
    statusCounts() {
      const counts = {}
      for (const c of this.candidates) {
        const stage = c.StageName || c.Status || 'Applied'
        counts[stage] = (counts[stage] || 0) + 1
      }
      return counts
    },
    directorAccessibleStages() {
      return this.stages.filter(s => s.permission && s.permission.roles && s.permission.roles.includes('Director'))
    },
    filteredCandidates() {
      let result = this.candidates
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(c => 
          `${c.FirstName} ${c.LastName}`.toLowerCase().includes(query) ||
          c.Email?.toLowerCase().includes(query) ||
          c.Position?.toLowerCase().includes(query)
        )
      }
      
      if (this.stageFilter) {
        result = result.filter(c => (c.StageName || 'Applied') === this.stageFilter)
      }
      
      return result
    }
  },
  async mounted() {
    await Promise.all([this.fetchCandidates(), this.fetchStages()])
  },
  methods: {
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
    async fetchCandidates() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(this.apiBase + "/api/get-candidates")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        this.candidates = data.candidates || []
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async silentFetchCandidates() {
      try {
        const res = await fetch(this.apiBase + "/api/get-candidates")
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
      if (!stage || !stage.permission || !stage.permission.roles.includes('Director')) {
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
        await this.silentFetchCandidates()
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
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }
}
</script>
