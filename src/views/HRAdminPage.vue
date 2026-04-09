<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-slate-900">HR Admin Dashboard</h1>
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

    <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">Create Requisition</h2>
      <form @submit.prevent="createRequisition" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input v-model="reqForm.title" placeholder="Job Title *" required
          class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input v-model="reqForm.jobRequisitionNumber" placeholder="Job Requisition Number"
          class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input v-model="reqForm.department" placeholder="Department"
          class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input v-model="reqForm.hiringManager" placeholder="Hiring Manager"
          class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input v-model="reqForm.jdIntiationDate" type="date" placeholder="JD Intiation Date"
          class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select v-model="reqForm.hiringType"
          class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Hiring Type</option>
          <option value="On Role">On Role</option>
          <option value="Permanent">Permanent</option>
        </select>
        <select v-model="reqForm.fy"
          class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">FY</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
        <select v-model="reqForm.period"
          class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Period</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
          <option value="P4">P4</option>
          <option value="P5">P5</option>
          <option value="P6">P6</option>
          <option value="P7">P7</option>
          <option value="P8">P8</option>
          <option value="P9">P9</option>
          <option value="P10">P10</option>
          <option value="P11">P11</option>
          <option value="P12">P12</option>
        </select>
        <textarea v-model="reqForm.jobDescription" placeholder="Job Description" rows="2"
          class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-3"></textarea>
        <div class="md:col-span-3">
          <label class="block text-sm font-medium text-slate-700 mb-1">Attach JD Document</label>
          <input type="file" ref="jdFile" @change="handleJdFileChange" accept=".pdf,.doc,.docx,.txt"
            class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          <p v-if="reqForm.jobDescriptionUrl" class="text-sm text-green-600 mt-1">File attached: {{ getFileNameFromUrl(reqForm.jobDescriptionUrl) }}</p>
        </div>
        <div class="md:col-span-3">
          <button type="submit" :disabled="submittingReq"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50">
            {{ submittingReq ? 'Creating...' : 'Create Requisition' }}
          </button>
        </div>
      </form>
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
        <select v-model="form.requisitionId"
          class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">-- Select Requisition --</option>
          <option v-for="r in requisitions" :key="r.Id" :value="r.Id">{{ r.Title }}</option>
        </select>
        <textarea v-model="form.notes" placeholder="Notes" rows="2"
          class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"></textarea>
        <div class="md:col-span-2">
          <button type="submit" :disabled="submitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50">
            {{ submitting ? 'Saving...' : 'Add Candidate' }}
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">All Candidates</h2>
      <div v-if="loading" class="text-slate-500 text-center py-8">Loading candidates...</div>
      <div v-else-if="candidates.length === 0" class="text-slate-500 text-center py-8">No candidates yet.</div>
      <div v-else class="space-y-2">
        <div class="grid grid-cols-5 gap-4 px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
          <div>Name</div><div>Email</div><div>Position</div><div>Status</div><div>Requisition</div>
        </div>
        <CandidateDetail v-for="c in candidates" :key="c.Id"
          :candidate="c"
          :status-options="hrStatusOptions"
          comment-role="HRAdmin"
          :show-rating="true"
          @status-change="updateStatus" />
      </div>
    </div>
  </div>
</template>

<script>
import CandidateDetail from '../components/CandidateDetail.vue'

export default {
  name: "HRAdminPage",
  components: { CandidateDetail },
  data() {
    return {
      candidates: [],
      requisitions: [],
      loading: false,
      submitting: false,
      submittingReq: false,
      uploadingJd: false,
      error: null,
      success: null,
      hrStatusOptions: ['Applied', 'Screening', 'Selected', 'Rejected', 'Hold'],
      form: { firstName: "", lastName: "", email: "", phone: "", position: "", notes: "", requisitionId: "" },
      reqForm: { title: "", jobRequisitionNumber: "", department: "", hiringManager: "", jdIntiationDate: "", jobDescription: "", hiringType: "", fy: "", period: "", jobDescriptionUrl: "" },
      apiBase: import.meta.env.VITE_API_URL || ""
    }
  },
  async mounted() {
    await Promise.all([this.fetchCandidates(), this.fetchRequisitions()])
  },
  methods: {
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
        this.success = "Requisition created!"
        this.reqForm = { title: "", jobRequisitionNumber: "", department: "", hiringManager: "", jdIntiationDate: "", jobDescription: "", hiringType: "", fy: "", period: "", jobDescriptionUrl: "" }
        if (this.$refs.jdFile) this.$refs.jdFile.value = ''
        await this.fetchRequisitions()
      } catch (err) {
        this.error = err.message
      } finally {
        this.submittingReq = false
      }
    },
    async handleJdFileChange(event) {
      const file = event.target.files[0]
      if (!file) return
      
      this.uploadingJd = true
      this.error = null
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const res = await fetch(this.apiBase + "/api/upload-jd", {
          method: 'POST',
          body: formData
        })
        
        if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`)
        
        const data = await res.json()
        this.reqForm.jobDescriptionUrl = data.url
        this.success = 'JD document uploaded successfully!'
      } catch (err) {
        this.error = 'Failed to upload JD document: ' + err.message
        if (this.$refs.jdFile) this.$refs.jdFile.value = ''
      } finally {
        this.uploadingJd = false
      }
    },
    getFileNameFromUrl(url) {
      if (!url) return ''
      const parts = url.split('/')
      return parts[parts.length - 1] || url
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
        this.success = "Candidate added!"
        this.form = { firstName: "", lastName: "", email: "", phone: "", position: "", notes: "", requisitionId: "" }
        await this.fetchCandidates()
      } catch (err) {
        this.error = err.message
      } finally {
        this.submitting = false
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
