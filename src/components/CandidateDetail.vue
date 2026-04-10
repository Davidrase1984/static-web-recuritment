<template>
  <div class="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-card transition-shadow duration-200">
    <div class="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors duration-200"
      @click="expanded = !expanded">
      <div class="flex-1 grid grid-cols-5 gap-4 items-center">
        <div class="font-medium text-slate-800 text-sm">{{ candidate.FirstName }} {{ candidate.LastName }}</div>
        <div class="text-slate-600 text-sm truncate">{{ candidate.Email }}</div>
        <div class="text-slate-600 text-sm truncate">{{ candidate.Position || '--' }}</div>
        <div>
          <select v-if="statusOptions.length" v-model="candidate.Status" @change.stop="$emit('status-change', candidate)"
            @click.stop
            class="text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:border-gray-300 transition-colors">
            <option v-for="s in statusOptions" :key="s">{{ s }}</option>
          </select>
          <StatusBadge v-else :status="candidate.Status" />
        </div>
        <div class="text-slate-400 text-xs truncate">{{ candidate.RequisitionTitle || '--' }}</div>
      </div>
      <svg class="w-5 h-5 text-slate-400 ml-2 transition-transform duration-200 flex-shrink-0" :class="{ 'rotate-180': expanded }"
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <div v-if="expanded" class="border-t border-gray-100 bg-slate-50 p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Candidate Details</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500">Phone:</span>
              <span class="text-slate-800 font-medium">{{ candidate.Phone || '--' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Applied:</span>
              <span class="text-slate-800 font-medium">{{ formatDate(candidate.CreatedAt) }}</span>
            </div>
            <div v-if="candidate.Notes">
              <span class="text-slate-500 block mb-1">Notes:</span>
              <p class="text-slate-700 bg-white p-2 rounded-lg text-xs">{{ candidate.Notes }}</p>
            </div>
          </div>
        </div>
        <div>
          <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Comments</h4>
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
import StatusBadge from './StatusBadge.vue'
import CommentList from './CommentList.vue'

export default {
  name: "CandidateDetail",
  components: { StatusBadge, CommentList },
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
    formatDate(dateStr) {
      if (!dateStr) return "--"
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }
}
</script>
