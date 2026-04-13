<template>
  <nav class="bg-white shadow-sm border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <router-link to="/hr-admin" class="text-xl font-bold text-slate-900">
            Recruitment Dashboard
          </router-link>
        </div>
        <div class="flex items-center space-x-1">
          <router-link to="/apply"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            :class="$route.path === '/apply' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'">
            Apply
          </router-link>
          <router-link v-if="isAuthenticated" to="/hr-admin"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            :class="$route.path === '/hr-admin' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'">
            HR Admin
          </router-link>
          <router-link v-if="isAuthenticated" to="/hiring-manager"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            :class="$route.path === '/hiring-manager' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'">
            Hiring Manager
          </router-link>
          <router-link v-if="isAuthenticated" to="/director"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            :class="$route.path === '/director' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'">
            Director
          </router-link>

          <!-- Auth Buttons -->
          <div class="ml-4 pl-4 border-l border-slate-200">
            <template v-if="isAuthenticated">
              <span class="text-sm text-slate-500 mr-3">{{ userName }}</span>
              <a :href="logoutUrl"
                class="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors duration-200 cursor-pointer">
                Logout
              </a>
            </template>
            <template v-else>
              <a :href="loginUrl"
                class="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 cursor-pointer">
                Login with Microsoft
              </a>
            </template>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "NavBar",
  data() {
    return {
      user: null,
      loginUrl: "/.auth/login/aad?post_login_redirect_uri=" + encodeURIComponent(window.location.pathname),
      logoutUrl: "/.auth/logout?post_logout_redirect_uri=/"
    }
  },
  computed: {
    isAuthenticated() {
      return this.user && this.user.clientPrincipal !== null
    },
    userName() {
      if (this.user && this.user.clientPrincipal) {
        return this.user.clientPrincipal.userDetails
      }
      return ""
    }
  },
  async mounted() {
    try {
      const response = await fetch("/.auth/me")
      if (response.ok) {
        this.user = await response.json()
      }
    } catch (e) {
      this.user = null
    }
  }
}
</script>