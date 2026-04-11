<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-2xl font-bold text-slate-900">Open Positions</h1>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {{ requisitions.length }} Open
          </span>
        </div>
        <p class="text-sm text-slate-500">Browse open positions and apply online</p>
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

      <!-- Job Detail View -->
      <div v-if="selectedRequisition && !showForm" class="mb-8">
        <button @click="selectedRequisition = null"
          class="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to all positions
        </button>

        <div class="bg-white rounded-xl shadow-card overflow-hidden">
          <div class="p-6 sm:p-8">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h2 class="text-xl font-bold text-slate-900">{{ selectedRequisition.Title }}</h2>
                <div class="flex flex-wrap items-center gap-3 mt-2">
                  <span v-if="selectedRequisition.Department" class="inline-flex items-center text-xs text-slate-600">
                    <svg class="w-3.5 h-3.5 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {{ selectedRequisition.Department }}
                  </span>
                  <span v-if="selectedRequisition.HiringManagerName" class="inline-flex items-center text-xs text-slate-600">
                    <svg class="w-3.5 h-3.5 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {{ selectedRequisition.HiringManagerName }}
                  </span>
                  <span v-if="selectedRequisition.HiringType" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {{ selectedRequisition.HiringType }}
                  </span>
                  <span v-if="selectedRequisition.FY" class="inline-flex items-center text-xs text-slate-500">
                    FY {{ selectedRequisition.FY }}{{ selectedRequisition.Period ? ' - ' + selectedRequisition.Period : '' }}
                  </span>
                </div>
              </div>
              <button @click="showForm = true"
                class="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Apply Now
              </button>
            </div>

            <div v-if="selectedRequisition.JobRequisitionNumber" class="mb-4 text-sm text-slate-500">
              Requisition #: <span class="font-medium text-slate-700">{{ selectedRequisition.JobRequisitionNumber }}</span>
            </div>

            <div v-if="selectedRequisition.Description" class="prose prose-slate max-w-none">
              <h4 class="text-sm font-semibold text-slate-700 mb-2">Job Description</h4>
              <p class="text-sm text-slate-600 whitespace-pre-line">{{ selectedRequisition.Description }}</p>
            </div>

            <div v-if="selectedRequisition.JobDescriptionUrl" class="mt-4 pt-4 border-t border-slate-100">
              <a :href="selectedRequisition.JobDescriptionUrl" target="_blank" rel="noopener"
                class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Job Description
              </a>
            </div>

            <div class="mt-4 text-xs text-slate-400">
              Posted {{ formatDate(selectedRequisition.CreatedAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Application Form -->
      <div v-if="selectedRequisition && showForm" class="mb-8">
        <button @click="showForm = false"
          class="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to job details
        </button>

        <div class="bg-white rounded-xl shadow-card p-6 sm:p-8">
          <h2 class="text-lg font-semibold text-slate-900 mb-1">Apply for {{ selectedRequisition.Title }}</h2>
          <p class="text-sm text-slate-500 mb-6">{{ selectedRequisition.Department || 'Department not specified' }}</p>

          <form @submit.prevent="submitApplication" class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                <input v-model="form.firstName" required placeholder="Enter your first name"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                <input v-model="form.lastName" required placeholder="Enter your last name"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                <input v-model="form.email" type="email" required placeholder="you@example.com"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input v-model="form.phone" type="tel" placeholder="+1 234 567 8900"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
              <textarea v-model="form.notes" rows="3" placeholder="Tell us anything else you'd like us to know..."
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="showForm = false"
                class="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="submitting"
                class="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                {{ submitting ? 'Submitting...' : 'Submit Application' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Job Listings -->
      <div v-if="!selectedRequisition">
        <div v-if="loading" class="text-center py-12">
          <svg class="w-8 h-8 mx-auto text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-4 text-sm text-slate-500">Loading positions...</p>
        </div>

        <div v-else-if="requisitions.length === 0" class="bg-white rounded-xl shadow-card p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 class="text-lg font-semibold text-slate-700 mb-2">No Open Positions</h3>
          <p class="text-sm text-slate-500">There are currently no open positions. Please check back later.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="req in requisitions" :key="req.Id"
            class="bg-white rounded-xl shadow-card hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden"
            @click="selectRequisition(req)">
            <div class="p-5">
              <div class="flex items-start justify-between mb-3">
                <h3 class="text-base font-semibold text-slate-900 leading-tight">{{ req.Title }}</h3>
                <span class="flex-shrink-0 ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Open
                </span>
              </div>

              <div class="space-y-2 mb-4">
                <div v-if="req.Department" class="flex items-center text-sm text-slate-600">
                  <svg class="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {{ req.Department }}
                </div>
                <div v-if="req.HiringManagerName" class="flex items-center text-sm text-slate-600">
                  <svg class="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {{ req.HiringManagerName }}
                </div>
                <div v-if="req.HiringType" class="flex items-center text-sm text-slate-600">
                  <svg class="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {{ req.HiringType }}
                </div>
              </div>

              <p v-if="req.Description" class="text-sm text-slate-500 line-clamp-2 mb-4">{{ req.Description }}</p>

              <div class="flex items-center justify-between pt-3 border-t border-slate-100">
                <span class="text-xs text-slate-400">Posted {{ formatDate(req.CreatedAt) }}</span>
                <span class="inline-flex items-center text-xs font-medium text-blue-600">
                  View Details
                  <svg class="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ApplyPage",
  data() {
    return {
      requisitions: [],
      selectedRequisition: null,
      showForm: false,
      loading: false,
      submitting: false,
      error: null,
      success: null,
      form: { firstName: "", lastName: "", email: "", phone: "", notes: "" },
      apiBase: import.meta.env.VITE_API_URL || ""
    }
  },
  async mounted() {
    await this.fetchRequisitions()
  },
  methods: {
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
    selectRequisition(req) {
      this.selectedRequisition = req
      this.showForm = false
      this.error = null
      this.success = null
      window.scrollTo(0, 0)
    },
    async submitApplication() {
      this.submitting = true
      this.error = null
      this.success = null
      try {
        const res = await fetch(this.apiBase + "/api/create-candidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: this.form.firstName,
            lastName: this.form.lastName,
            email: this.form.email,
            phone: this.form.phone,
            position: this.selectedRequisition.Title,
            notes: this.form.notes,
            requisitionId: this.selectedRequisition.Id
          })
        })
        if (!res.ok) {
          const text = await res.text()
          try { const d = JSON.parse(text); throw new Error(d.error || `HTTP ${res.status}`) }
          catch (e) { if (e.message && !e.message.startsWith('HTTP')) throw e; throw new Error(`HTTP ${res.status} - ${text.substring(0, 100)}`) }
        }
        this.success = "Your application has been submitted successfully! We will review it and get back to you."
        this.form = { firstName: "", lastName: "", email: "", phone: "", notes: "" }
        this.showForm = false
      } catch (err) {
        this.error = err.message
      } finally {
        this.submitting = false
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return "--"
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }
}
</script>
