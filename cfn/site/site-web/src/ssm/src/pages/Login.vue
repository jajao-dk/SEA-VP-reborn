<script setup>
import { useAuth } from '../plugins/auth'

const { login } = useAuth()
</script>

<template>
  <div>
    <div class="logoBox">
      <!-- Lite Version -->
      <div class="tagIcon">
        Lite version
      </div>
      <img
        src="/sailingship.svg"
        class="logoMark"
      >
      <!-- SSM text -->
      <svg
        class="logoTxt"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 296 22"
      >
        <g fill="#2D91B3">
          <path d="M1,15.59h2.88c0.03,2.02,1.12,3,2.86,3c1.88,0,2.8-1.12,2.8-2.69c0-3.89-8.2-4.12-8.2-9.94C1.34,3.13,3.41,1,6.71,1c3.36,0,5.38,2.16,5.46,5.49H9.29C9.23,4.61,8.25,3.71,6.74,3.71c-1.6,0-2.52,0.9-2.52,2.3c0,3.84,8.23,3.84,8.23,9.91c0,2.91-2.04,5.4-5.71,5.4C3.27,21.33,1.03,19.17,1,15.59z" />
          <path d="M22.53,17.02h-5.18l-0.9,3.95h-2.97l4.93-19.6h3.05l4.93,19.6h-2.94L22.53,17.02z M21.94,14.38l-1.23-5.26c-0.28-1.29-0.59-3.16-0.73-4.2H19.9c-0.14,1.04-0.42,2.91-0.73,4.2l-1.2,5.26H21.94z" />
          <path d="M31.41,4.02v5.85h5.91v2.58h-5.91v8.51h-2.83V1.36h9.24v2.66H31.41z" />
          <path d="M50.36,18.3v2.66h-9.88V1.36h9.6v2.66h-6.78v5.68h6.24v2.6h-6.24v5.99H50.36z" />
          <path d="M62.94,4.05h-4.09v16.91h-2.88V4.05H51.9V1.36h11.03V4.05z" />
          <path d="M68.23,14.52L63.47,1.36h2.94l2.21,6.52c0.28,0.84,0.7,2.1,0.98,3.08h0.06l1.01-3.13l2.18-6.47h2.97l-4.76,13.16v6.44h-2.83V14.52z" />
          <path d="M82.62,15.59h2.88c0.03,2.02,1.12,3,2.86,3c1.88,0,2.8-1.12,2.8-2.69c0-3.89-8.2-4.12-8.2-9.94c0-2.83,2.07-4.96,5.38-4.96c3.36,0,5.38,2.16,5.46,5.49h-2.88c-0.06-1.88-1.04-2.77-2.55-2.77c-1.6,0-2.52,0.9-2.52,2.3c0,3.84,8.23,3.84,8.23,9.91c0,2.91-2.04,5.4-5.71,5.4C84.89,21.33,82.65,19.17,82.62,15.59z" />
          <path d="M106.42,4.05h-4.09v16.91h-2.88V4.05h-4.06V1.36h11.03V4.05z" />
          <path d="M115.41,17.02h-5.18l-0.9,3.95h-2.97l4.93-19.6h3.05l4.93,19.6h-2.94L115.41,17.02z M114.82,14.38l-1.23-5.26c-0.28-1.29-0.59-3.16-0.73-4.2h-0.08c-0.14,1.04-0.42,2.91-0.73,4.2l-1.2,5.26H114.82z" />
          <path d="M130.3,4.05h-4.09v16.91h-2.88V4.05h-4.06V1.36h11.03V4.05z" />
          <path d="M132.37,15V1.36h2.88V15c0,2.38,1.09,3.5,2.86,3.5c1.79,0,2.88-1.12,2.88-3.5V1.36h2.86V15c0,4-2.24,6.24-5.74,6.24C134.64,21.24,132.37,19,132.37,15z" />
          <path d="M146.23,15.59h2.88c0.03,2.02,1.12,3,2.86,3c1.88,0,2.8-1.12,2.8-2.69c0-3.89-8.2-4.12-8.2-9.94c0-2.83,2.07-4.96,5.38-4.96c3.36,0,5.38,2.16,5.46,5.49h-2.88c-0.06-1.88-1.04-2.77-2.55-2.77c-1.6,0-2.52,0.9-2.52,2.3c0,3.84,8.23,3.84,8.23,9.91c0,2.91-2.04,5.4-5.71,5.4C148.5,21.33,146.26,19.17,146.23,15.59z" />
          <path d="M181.85,1.36v19.6h-2.77v-7.64c0.06-2.24,0.11-4.29,0.22-6.33l-0.11-0.06c-0.56,1.57-1.23,3.36-1.9,5.15l-1.71,4.45h-2.8l-1.71-4.45c-0.67-1.79-1.34-3.58-1.9-5.15l-0.11,0.06c0.08,2.04,0.17,4.09,0.22,6.33v7.64h-2.77V1.36h2.88l3.3,7.95c0.45,1.12,1.12,3,1.43,3.89h0.11c0.31-0.9,0.98-2.77,1.43-3.89l3.3-7.95H181.85z" />
          <path d="M185.21,14.75V7.58c0-4.09,2.24-6.58,5.99-6.58s5.99,2.49,5.99,6.58v7.17c0,4.09-2.24,6.58-5.99,6.58S185.21,18.84,185.21,14.75z M194.28,14.75V7.58c0-2.46-1.06-3.81-3.08-3.81c-2.04,0-3.08,1.34-3.08,3.81v7.17c0,2.46,1.04,3.81,3.08,3.81C193.22,18.55,194.28,17.21,194.28,14.75z" />
          <path d="M200.55,1.36h2.83l4.51,10c0.59,1.32,1.32,3.14,1.79,4.31l0.08-0.06c-0.22-1.93-0.39-4.87-0.39-6.61V1.36h2.8v19.6h-2.83l-4.37-9.6c-0.59-1.46-1.4-3.5-1.88-4.76l-0.08,0.06c0.2,1.96,0.34,4.9,0.34,6.75v7.56h-2.8V1.36z" />
          <path d="M216.09,1.36h2.83v19.6h-2.83V1.36z" />
          <path d="M232.36,4.05h-4.09v16.91h-2.88V4.05h-4.06V1.36h11.03V4.05z" />
          <path d="M233.09,14.75V7.58c0-4.09,2.24-6.58,5.99-6.58s5.99,2.49,5.99,6.58v7.17c0,4.09-2.24,6.58-5.99,6.58S233.09,18.84,233.09,14.75z M242.16,14.75V7.58c0-2.46-1.06-3.81-3.08-3.81c-2.04,0-3.08,1.34-3.08,3.81v7.17c0,2.46,1.04,3.81,3.08,3.81C241.1,18.55,242.16,17.21,242.16,14.75z" />
          <path d="M252.33,13.85h-1.76v7.11h-2.83V1.36h5.07c3.75,0,5.88,2.24,5.88,6.13c0,3.05-1.29,5.15-3.53,5.96l4.26,7.5h-3.14L252.33,13.85z M250.56,11.16h2.18c1.99,0,3.02-1.29,3.02-3.61s-1.04-3.5-3-3.5h-2.21V11.16z" />
          <path d="M261.85,1.36h2.83v19.6h-2.83V1.36z" />
          <path d="M268.57,1.36h2.83l4.51,10c0.59,1.32,1.32,3.14,1.79,4.31l0.08-0.06c-0.22-1.93-0.39-4.87-0.39-6.61V1.36h2.8v19.6h-2.83l-4.37-9.6c-0.59-1.46-1.4-3.5-1.88-4.76l-0.08,0.06c0.2,1.96,0.34,4.9,0.34,6.75v7.56h-2.8V1.36z" />
          <path d="M283.55,15.14V7.16c0-3.98,2.18-6.11,5.74-6.11c3.47,0,5.57,2.1,5.71,5.96h-2.8c-0.11-2.27-1.12-3.25-2.91-3.25s-2.86,1.04-2.86,3.42v7.95c0,2.38,1.12,3.42,2.94,3.42c1.88,0,3-1.04,3-3.28v-2.46h-3.11v-2.52h5.88v4.98c-0.06,3.84-2.27,5.99-5.8,5.99C285.81,21.27,283.55,19.12,283.55,15.14z" />
        </g>
      </svg>
      <!-- weathernews text -->
      <div class="weathernews">
        powered by weathernews
      </div>
      <div
        class="enterBtn"
        @click="login()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 48 48"
        >
          <g>
            <polyline
              stroke-linecap="round"
              stroke-miterlimit="10"
              points="25,14 35,24 25,34"
            />
            <line
              stroke-linecap="round"
              stroke-miterlimit="10"
              x1="13"
              y1="24"
              x2="35"
              y2="24"
            />
          </g>
        </svg>
      </div>
    </div>
  </div>
  <div class="wave" />
  <div class="boxSdw" />
</template>

<style scoped>
    text-decoration : none ;
  }

  .img {
    border : 0px ;
  }
  .logoBox {
    z-index : 10 ;
    position : absolute ;
    top : calc((100vh - 480px) / 2) ;
    left : calc((100vw - 340px) / 2) ;
    width : 340px ;
    height : 480px ;
    background-color : rgba(255,255,255,0.5) ;
    padding-top : 79px ;
    border-radius : 12px ;
  }
  .logoTxt {
    display : block ;
    width : 296px ;
    height : 22px ;
    margin-left : auto ;
    margin-right : auto ;
    margin-bottom : 9px ;
    filter : drop-shadow(0px 1px 0px rgba(255,255,255,0.7)) ;
  }
  .weathernews {
    width : 100% ;
    height : 12px ;
    color : #69848c ;
    font-size : 12px ;
    line-height : 1em ;
    text-align : center ;
    margin-bottom : 56px ;
  }
  .tagIcon {
    position : absolute ;
    top : 0px ;
    right : 8px ;
    width : 100px ;
    height : 24px ;
    background : linear-gradient(0deg, #41d95a 0%, #30bf48 90%, #57d96d 95%, #1bb334 100%) ;
    color : #fff ;
    font-size : 13px ;
    line-height : 24px ;
    text-align : center ;
    text-shadow : 0px -1px 0px rgba(0,0,0,0.3) ;
    border-radius : 1px 1px 4px 4px ;
    box-shadow : 0px 1px 0px rgba(0,0,0,0.15) ;
  }
  .logoMark {
    display : block ;
    width : 234px ;
    height : 195px ;
    margin-left : auto ;
    margin-right : auto ;
    margin-bottom : 17px ;
  }
  .wave {
    position : absolute ;
    top : 0px ;
    left : 0px ;
    width : 100% ;
    height : 100% ;
    background-image : url('/wave.svg') ;
    background-repeat : no-repeat ;
    background-size : 100% auto ;
    background-position : center center ;
    background-color : #e1e9ed ;
  }

  .boxSdw {
    position : absolute ;
    top : calc((100vh - 480px) / 2 + 8px) ;
    left : calc((100vw - 340px) / 2) ;
    width : 340px ;
    height : 480px ;
    background-color : #00334d ;
    border-radius : 12px ;
    filter : blur(8px) ;
    opacity : 0.1 ;
  }

  .enterBtn {
    cursor : pointer ;
    position : relative ;
    width : 60px ;
    height : 60px ;
    background-color : #fff ;
    border-radius : 50% ;
    padding : 6px ;
    margin-left : auto ;
    margin-right : auto ;
    box-shadow : 0px 1px 3px rgba(0,40,76,0.1) ;
  }

  .enterBtn g {
    fill : none ;
    stroke : #2d91b3 ;
    stroke-width : 4 ;
  }

  .enterBtn:hover {
    background-color : #2d91b3 ;
    box-shadow : 0px 2px 4px rgba(0,40,76,0.2) ;
  }

  .enterBtn:hover g {
    stroke : #fff ;
  }
</style>
