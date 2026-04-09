<template>
  <div class="space-y-3">
    <div v-if="loading" class="text-slate-500 text-sm py-2">Loading comments...</div>
    <div v-else-if="comments.length === 0" class="text-slate-400 text-sm py-2">No comments yet.</div>
    <div v-else>
      <div v-for="comment in comments" :key="comment.Id"
        class="border border-slate-200 rounded-lg p-3"
        :class="roleBorder(comment.Role)">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
            :class="roleBadge(comment.Role)">
            {{ roleLabel(comment.Role) }}
          </span>
          <span class="text-xs text-slate-400">{{ formatDate(comment.CreatedAt) }}</span>
        </div>
        <div v-if="comment.AuthorName" class="text-xs text-slate-500 mb-1">
          by {{ comment.AuthorName }}
        </div>
        <p class="text-sm text-slate-700 whitespace-pre-wrap">{{ comment.CommentText }}</p>
        <div v-if="comment.Rating" class="mt-1 flex items-center gap-1">
          <span class="text-xs text-slate-500">Rating:</span>
          <span v-for="i in 5" :key="i" class="text-sm"
            :class="i <= comment.Rating ? 'text-yellow-500' : 'text-slate-300'">
            &#9733;
          </span>
        </div>
      </div>
    </div>

    <div v-if="showAddForm" class="border border-slate-200 rounded-lg p-3 bg-slate-50">
      <h4 class="text-sm font-semibold text-slate-700 mb-2">Add {{ roleLabel(role) }} Comment</h4>
      <textarea v-model="newComment" rows="3" placeholder="Write your comment..."
        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"></textarea>
      <div v-if="showRating" class="flex items-center gap-2 mb-2">
        <span class="text-sm text-slate-600">Rating:</span>
        <button v-for="i in 5" :key="i" @click="newRating = i" type="button"
          class="text-lg transition-colors duration-200"
          :class="i <= newRating ? 'text-yellow-500' : 'text-slate-300'">
          &#9733;
        </button>
      </div>
      <div class="flex items-center gap-2">
        <input v-model="authorName" placeholder="Your name" size="small"
          class="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40" />
        <button @click="submitComment" :disabled="!newComment.trim() || submitting"
          class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50">
          {{ submitting ? 'Adding...' : 'Add Comment' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CommentList",
  props: {
    candidateId: { type: Number, required: true },
    requisitionId: { type: Number, default: null },
    role: { type: String, required: true },
    showAddForm: { type: Boolean, default: true },
    showRating: { type: Boolean, default: false }
  },
  data() {
    return {
      comments: [],
      loading: false,
      newComment: "",
      newRating: 0,
      authorName: "",
      submitting: false,
      apiBase: import.meta.env.VITE_API_URL || ""
    }
  },
  async mounted() {
    await this.fetchComments()
  },
  watch: {
    candidateId() {
      this.fetchComments()
    }
  },
  methods: {
    async fetchComments() {
      this.loading = true
      try {
        const res = await fetch(this.apiBase + "/api/comments?candidateId=" + this.candidateId)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        this.comments = data.comments || []
      } catch (err) {
        console.error("Fetch comments error:", err)
      } finally {
        this.loading = false
      }
    },
    async submitComment() {
      this.submitting = true
      try {
        const body = {
          candidateId: this.candidateId,
          role: this.role,
          commentText: this.newComment.trim(),
          authorName: this.authorName.trim() || null
        }
        if (this.requisitionId) body.requisitionId = this.requisitionId
        if (this.showRating && this.newRating > 0) body.rating = this.newRating

        const res = await fetch(this.apiBase + "/api/create-comment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        this.newComment = ""
        this.newRating = 0
        await this.fetchComments()
        this.$emit("comment-added")
      } catch (err) {
        console.error("Create comment error:", err)
      } finally {
        this.submitting = false
      }
    },
    roleLabel(role) {
      const labels = { HiringManager: "Hiring Manager", HRAdmin: "HR Admin", Director: "Director" }
      return labels[role] || role
    },
    roleBadge(role) {
      const badges = {
        HiringManager: "bg-purple-100 text-purple-700",
        HRAdmin: "bg-green-100 text-green-700",
        Director: "bg-blue-100 text-blue-700"
      }
      return badges[role] || "bg-slate-100 text-slate-700"
    },
    roleBorder(role) {
      const borders = {
        HiringManager: "border-l-4 border-l-purple-400",
        HRAdmin: "border-l-4 border-l-green-400",
        Director: "border-l-4 border-l-blue-400"
      }
      return borders[role] || ""
    },
    formatDate(dateStr) {
      if (!dateStr) return ""
      const d = new Date(dateStr)
      return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  }
}
</script>
