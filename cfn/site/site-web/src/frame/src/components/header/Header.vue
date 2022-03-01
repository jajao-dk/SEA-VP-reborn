<script setup>
import { useAuth } from '../../plugins/auth'
import { useHeader } from './header'

const { user, logout } = useAuth()
const { menuOpen, toggleMenu } = useHeader()
</script>

<template>
  <div class="flex border-b-2 border-gray-200">
    <div class="container mx-auto h-16 relative">
      <div class="h-full flex items-center">
        <div class="flex-1">
          <router-link
            class="flex items-center gap-4 text-gray-700"
            to="/"
          >
            <div>
              <font-awesome-icon
                class="text-blue-500"
                size="2x"
                :icon="['fab', 'vuejs']"
              />
            </div>
            <div class="text-xl">
              Template Vue Application
            </div>
          </router-link>
        </div>
        <div class="flex-1">
          <div class="flex justify-end">
            <a
              class="hover:bg-gray-200 text-gray-500 cursor-pointer px-2 flex justify-end items-center gap-4"
              @click="toggleMenu()"
            >
              <div class="text-base">
                {{ user?.name }}
              </div>
              <div>
                <img
                  class="h-12 rounded-full"
                  :src="user?.picture"
                  :alt="user?.name"
                >
              </div>
            </a>
          </div>
        </div>
      </div>
      <div
        v-if="menuOpen"
        class="absolute right-0 mx-2 my-1 z-50"
      >
        <div class="bg-white overflow-hidden rounded shadow">
          <div class="flex flex-col text-base text-gray-500">
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
