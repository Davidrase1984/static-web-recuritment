<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="max-w-md w-full mx-4">
      <div class="bg-white rounded-xl shadow-lg p-8">
        <h1 class="text-2xl font-bold text-slate-900 mb-6 text-center">
          Welcome to Vue + Tailwind
        </h1>

        <div class="bg-slate-100 rounded-lg p-4 mb-4">
          <p class="text-sm text-slate-500 mb-1">Message from API</p>
          <p class="text-lg font-medium text-slate-800">
            {{ message || 'Loading...' }}
          </p>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-600">
            <span class="font-semibold">Error:</span> {{ error }}
          </p>
        </div>

        <div class="mt-6 flex justify-center gap-3">
          <button
            @click="refresh"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Refresh
          </button>
          <button
            @click="testError"
            class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors duration-200"
          >
            Test Error
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      message: "",
      error: null
    };
  },
  async mounted() {
    await this.fetchMessage();
  },
  methods: {
    async fetchMessage() {
      try {
        const response = await fetch("/api/message");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.message = data.text;
        this.error = null;
      } catch (err) {
        this.error = err.message;
        console.error('Fetch error:', err);
      }
    },
    async refresh() {
      this.message = "";
      await this.fetchMessage();
    },
    async testError() {
      try {
        const response = await fetch("/api/nonexistent");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (err) {
        this.error = err.message;
        console.error('Fetch error:', err);
      }
    }
  }
};
</script>
