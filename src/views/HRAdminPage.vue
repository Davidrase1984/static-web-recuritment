<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-2xl font-bold text-slate-900">HR Admin Dashboard</h1>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                HR Admin
              </span>
            </div>
            <p class="text-sm text-slate-500">Manage requisitions and track all candidates</p>
          </div>
          <button @click="refreshAll" :disabled="loading"
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
        <StatCard label="Total Candidates" :value="candidates.length" subtitle="All candidates" icon="users" variant="default" />
        <StatCard label="Open Requisitions" :value="openRequisitions" subtitle="Active positions" icon="chart" variant="success" highlight accentColor="#10b981" />
        <StatCard label="In Screening" :value="statusCounts['Screening'] || 0" subtitle="HR review" icon="offer" variant="info" highlight accentColor="#f59e0b" />
        <StatCard label="HR Selected" :value="statusCounts['HR Selected'] || 0" subtitle="Ready for director" icon="check" variant="primary" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-slate-900">Create Requisition</h2>
            <button v-if="!showRequisitionForm" @click="showRequisitionForm = true"
              class="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
          </div>

          <div v-if="showRequisitionForm">
            <form @submit.prevent="createRequisition" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">Job Title *</label>
                  <input v-model="reqForm.title" required placeholder="e.g. Senior Engineer"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">Job Requisition #</label>
                  <input v-model="reqForm.jobRequisitionNumber" placeholder="e.g. JR-2026-001"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">Department</label>
                  <input v-model="reqForm.department" placeholder="e.g. Engineering"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">Hiring Manager</label>
                  <input v-model="reqForm.hiringManager" placeholder="e.g. John Smith"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">Hiring Type</label>
                  <select v-model="reqForm.hiringType"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                    <option value="">Select type</option>
                    <option value="On Role">On Role</option>
                    <option value="Permanent">Permanent</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">JD Initiation Date</label>
                  <input v-model="reqForm.jdIntiationDate" type="date"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">FY</label>
                  <select v-model="reqForm.fy"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                    <option value="">Select FY</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">Period</label>
                  <select v-model="reqForm.period"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                    <option value="">Select Period</option>
                    <option v-for="p in periods" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Job Description</label>
                <textarea v-model="reqForm.jobDescription" rows="3" placeholder="Enter job description..."
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"></textarea>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Attach JD Document</label>
                <div class="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-300 transition-colors cursor-pointer"
                  @click="$refs.jdFileInput.click()" @dragover.prevent @drop.prevent="handleDrop">
                  <input type="file" ref="jdFileInput" @change="handleJdFileChange" accept=".pdf,.doc,.docx,.txt" class="hidden" />
                  <svg class="w-8 h-8 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="text-sm text-slate-500">
                    <span v-if="reqForm.jobDescriptionUrl" class="text-emerald-600 font-medium">File attached: {{ getFileNameFromUrl(reqForm.jobDescriptionUrl) }}</span>
                    <span v-else>Drop PDF/DOC here or <span class="text-primary-600 font-medium">browse</span></span>
                  </p>
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-4">
                <button type="button" @click="cancelRequisitionForm"
                  class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" :disabled="submittingReq"
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
                  {{ submittingReq ? 'Creating...' : 'Create Requisition' }}
                </button>
              </div>
            </form>
          </div>

          <div v-else class="text-center py-8 text-slate-400">
            <p class="text-sm">Click "New" to create a requisition</p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-slate-900">Add Candidate</h2>
            <button v-if="!showCandidateForm" @click="showCandidateForm = true"
              class="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
          </div>

          <div v-if="showCandidateForm">
            <form @submit.prevent="createCandidate" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">First Name *</label>
                  <input v-model="form.firstName" required placeholder="John"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">Last Name *</label>
                  <input v-model="form.lastName" required placeholder="Doe"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">Email *</label>
                  <input v-model="form.email" type="email" required placeholder="john@example.com"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                  <input v-model="form.phone" placeholder="+1 234 567 8900"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">Position</label>
                  <input v-model="form.position" placeholder="e.g. Software Engineer"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">Requisition</label>
                  <select v-model="form.requisitionId"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                    <option value="">Select requisition</option>
                    <option v-for="r in requisitions" :key="r.Id" :value="r.Id">{{ r.Title }}</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                <textarea v-model="form.notes" rows="2" placeholder="Any additional notes..."
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"></textarea>
              </div>

              <div class="flex justify-end gap-3 pt-4">
                <button type="button" @click="cancelCandidateForm"
                  class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" :disabled="submitting"
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
                  {{ submitting ? 'Adding...' : 'Add Candidate' }}
                </button>
              </div>
            </form>
          </div>

          <div v-else class="text-center py-8 text-slate-400">
            <p class="text-sm">Click "New" to add a candidate</p>
          </div>
        </div>
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
                  class="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
              </div>
              <select v-model="stageFilter"
                class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer">
                <option value="">All Stages</option>
                <option v-for="s in hrAccessibleStages" :key="s.stage" :value="s.name">{{ s.name }}</option>
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
                    <div class="flex justify-between items-center text-sm pt-2 mt-2 border-t border-slate-200">
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
                  <h4 class="text-xs font-semibold text-slate-500 uppercase mb-3">HR Comments</h4>
                  <CommentList :candidate-id="candidate.Id" :requisition-id="candidate.RequisitionId" role="HRAdmin" :show-add-form="true" :show-rating="true" />
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
  name: "HRAdminPage",
  components: { StatCard, StatusBadge, CommentList },
  data() {
    return {
      candidates: [],
      requisitions: [],
      stages: [],
      loading: false,
      submitting: false,
      submittingReq: false,
      uploadingJd: false,
      error: null,
      success: null,
      searchQuery: '',
      stageFilter: '',
      expandedId: null,
      showRequisitionForm: false,
      showCandidateForm: false,
      periods: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12'],
      form: { firstName: "", lastName: "", email: "", phone: "", position: "", notes: "", requisitionId: "" },
      reqForm: { title: "", jobRequisitionNumber: "", department: "", hiringManager: "", jdIntiationDate: "", jobDescription: "", hiringType: "", fy: "", period: "", jobDescriptionUrl: "" },
      apiBase: import.meta.env.VITE_API_URL || "",
      uploadUrl: import.meta.env.VITE_UPLOAD_URL || "",
      currentUser: 'HR Admin',
      currentRole: 'HRAdmin'
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
    openRequisitions() {
      return this.requisitions.filter(r => r.Status === 'Open').length
    },
    hrAccessibleStages() {
      return this.stages.filter(s => s.permission && s.permission.roles && s.permission.roles.includes('HRAdmin'))
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
    await this.refreshAll()
  },
  methods: {
    async refreshAll() {
      await Promise.all([this.fetchCandidates(), this.fetchRequisitions(), this.fetchStages()])
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
    async fetchRequisitions() {
      try {
        const res = await fetch(this.apiBase + "/api/requisitions")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        this.requisitions = data.requisitions || []
      } catch (err) {
        console.error("Fetch requisitions error:", err)
      }
    },
    toggleExpand(id) {
      this.expandedId = this.expandedId === id ? null : id
    },
    cancelRequisitionForm() {
      this.showRequisitionForm = false
      this.reqForm = { title: "", jobRequisitionNumber: "", department: "", hiringManager: "", jdIntiationDate: "", jobDescription: "", hiringType: "", fy: "", period: "", jobDescriptionUrl: "" }
      if (this.$refs.jdFileInput) this.$refs.jdFileInput.value = ''
    },
    cancelCandidateForm() {
      this.showCandidateForm = false
      this.form = { firstName: "", lastName: "", email: "", phone: "", position: "", notes: "", requisitionId: "" }
    },
    async createRequisition() {
      this.submittingReq = true
      this.error = null
      this.success = null
      try {
        const res = await fetch(this.apiBase + "/api/create-requisition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.reqForm)
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        this.success = "Requisition created successfully!"
        this.cancelRequisitionForm()
        await this.fetchRequisitions()
      } catch (err) {
        this.error = err.message
      } finally {
        this.submittingReq = false
      }
    },
    async createCandidate() {
      this.submitting = true
      this.error = null
      this.success = null
      try {
        const res = await fetch(this.apiBase + "/api/create-candidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form)
        })
        if (!res.ok) {
          const text = await res.text()
          try { const d = JSON.parse(text); throw new Error(d.error || `HTTP ${res.status}`) }
          catch { throw new Error(`HTTP ${res.status} - ${text.substring(0, 100)}`) }
        }
        this.success = "Candidate added successfully!"
        this.cancelCandidateForm()
        await this.silentFetchCandidates()
      } catch (err) {
        this.error = err.message
      } finally {
        this.submitting = false
      }
    },
    getNextStages(currentStage) {
      const stageNum = typeof currentStage === 'string' ? this.getStageNumFromName(currentStage) : (currentStage || 1)
      const currentStageName = this.stages.find(s => s.stage === stageNum)?.name || 'Applied'
      const stage = this.stages.find(s => s.name === currentStageName)
      if (!stage || !stage.permission || !stage.permission.roles.includes('HRAdmin')) {
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
        await this.silentFetchCandidates()
      } catch (err) {
        this.error = err.message
        candidate.nextStage = ''
      }
    },
    async handleJdFileChange(event) {
      const file = event.target.files[0]
      if (!file) return
      await this.uploadFile(file)
    },
    async handleDrop(event) {
      const file = event.dataTransfer.files[0]
      if (file) await this.uploadFile(file)
    },
    async uploadFile(file) {
      this.uploadingJd = true
      this.error = null
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch((this.uploadUrl || this.apiBase) + "/api/upload-jd", { method: 'POST', body: formData })
        if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`)
        const data = await res.json()
        this.reqForm.jobDescriptionUrl = data.url
        this.success = 'JD document uploaded successfully!'
      } catch (err) {
        this.error = 'Failed to upload JD document: ' + err.message
        if (this.$refs.jdFileInput) this.$refs.jdFileInput.value = ''
      } finally {
        this.uploadingJd = false
      }
    },
    getFileNameFromUrl(url) {
      if (!url) return ''
      const parts = url.split('/')
      return parts[parts.length - 1] || url
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
