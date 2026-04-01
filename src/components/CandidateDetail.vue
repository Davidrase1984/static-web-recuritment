<template>
  <div class="border border-slate-200 rounded-lg overflow-hidden">
    <div class="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors duration-200"
      @click="expanded = !expanded">
      <div class="flex-1 grid grid-cols-5 gap-4 text-sm">
        <div class="font-medium text-slate-800">{{ candidate.FirstName }} {{ candidate.LastName }}</div>
        <div class="text-slate-600">{{ candidate.Email }}</div>
        <div class="text-slate-600">{{ candidate.Position || '--' }}</div>
        <div>
          <select v-if="statusOptions.length" v-model="candidate.Status" @change.stop="$emit('status-change', candidate)"
            @click.stop class="text-xs px-2 py-1 border border-slate-200 rounded bg-white">
            <option v-for="s in statusOptions" :key="s">{{ s }}</option>
          </select>
          <span v-else class="text-xs px-2 py-1 rounded-full" :class="statusClass(candidate.Status)">
            {{ candidate.Status }}
          </span>
        </div>
        <div class="text-slate-400 text-xs">{{ candidate.RequisitionTitle || '--' }}</div>
      </div>
      <svg class="w-5 h-5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': expanded }"
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <div v-if="expanded" class="border-t border-slate-200 bg-slate-50 p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="text-sm font-semibold text-slate-700 mb-3">Candidate Details</h4>
          <div class="space-y-2 text-sm">
            <div><span class="text-slate-500">Phone:</span> <span class="text-slate-800">{{ candidate.Phone || '--' }}</span></div>
            <div><span class="text-slate-500">Notes:</span> <span class="text-slate-800">{{ candidate.Notes || '--' }}</span></div>
            <div><span class="text-slate-500">Applied:</span> <span class="text-slate-800">{{ formatDate(candidate.CreatedAt) }}</span></div>
          </div>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-slate-700 mb-3">Comments</h4>
          <CommentList
            :candidate-id="candidate.Id"
            :requisition-id="candidate.RequisitionId"
            :role="commentRole"
            :show-add-form="showCommentForm"
            :show-rating="showRating" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CommentList from './CommentList.vue'

export default {
  name: "CandidateDetail",
  components: { CommentList },
  props: {
    candidate: { type: Object, required: true },
    statusOptions: { type: Array, default: () => [] },
    commentRole: { type: String, required: true },
    showCommentForm: { type: Boolean, default: true },
    showRating: { type: Boolean, default: false }
  },
  emits: ['status-change'],
  data() {
    return {
      expanded: false
    }
  },
  methods: {
    statusClass(status) {
      const classes = {
        Applied: "bg-slate-100 text-slate-700",
        Screening: "bg-yellow-100 text-yellow-700",
        Interview: "bg-purple-100 text-purple-700",
        Selected: "bg-green-100 text-green-700",
        Rejected: "bg-red-100 text-red-700",
        Hold: "bg-orange-100 text-orange-700",
        Offer: "bg-blue-100 text-blue-700",
        Hired: "bg-emerald-100 text-emerald-700"
      }
      return classes[status] || "bg-slate-100 text-slate-700"
    },
    formatDate(dateStr) {
      if (!dateStr) return "--"
      return new Date(dateStr).toLocaleDateString()
    }
  }
}
</script>
