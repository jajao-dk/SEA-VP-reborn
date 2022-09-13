<script setup>
import { watch, toRef } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../../plugins/auth'
import { useStore } from './store'

const route = useRoute()
const { user, logout } = useAuth()
const store = useStore()

watch(toRef(route, 'name'), () => { store.close() })
</script>

<template>
  <div class="flex bg-background border-b-2 border-gray-200">
    <!--  <div class="container mx-auto h-16 relative"> -->
    <div class="flex-auto px-4 h-12 relative">
      <div class="h-full flex items-center">
        <div class="flex-1">
          <div class="flex items-center space-x-5">
            <a @click="store.toggleDrawer()">
              <font-awesome-icon
                class="text-gray-100 cursor-pointer"
                size="lg"
                :icon="['fas', 'bars']"
              />
            </a>
            <router-link
              class="flex items-center gap-4 text-gray-700"
              to="/"
            >
              <div class="space-x-4">
                <img
                  src="../../assets/img/Weathernews_logo_white.svg"
                  class="h-10"
                >
              </div>
            </router-link>
            <div class="text-gray-100 text-2xl flex">
              <!-- <div class="font-bold"> -->
                {{ $route.meta.title }}
                <!-- GREEN-Dashboard by OSR/PMS-e -->
              <!-- </div> -->
              <!-- <div class="text-xs">
                powered by Weathernews
              </div> -->
            </div>
          </div>
        </div>
        <div class="flex-1">
          <div class="flex justify-end">
            <a
              class="hover:text-gray-800 text-gray-100 cursor-pointer px-2 flex justify-end items-center gap-4"
              @click="store.toggleMenu()"
            >
              <div class="text-base">
                {{ user?.name }}
              </div>
              <div>
                <img
                  class="h-10 rounded-full"
                  :src="user?.picture"
                  :alt="user?.name"
                >
              </div>
            </a>
          </div>
        </div>
      </div>
      <div
        v-if="store.menuOpen"
        class="absolute right-0 mx-2 my-1 z-50"
      >
        <div class="bg-white overflow-hidden rounded shadow">
          <div class="flex flex-col text-base text-gray-500">
            <!-- <router-link
              class="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center gap-2"
              to="/profile"
            >
              <span>
                <font-awesome-icon :icon="['fas', 'user']" />
              </span>
              <span>
                Profile
              </span>
            </router-link> -->
            <a
              class="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center gap-2"
              @click="logout()"
            >
              <span>
                <font-awesome-icon :icon="['fas', 'sign-out-alt']" />
              </span>
              <span>
                Logout
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
