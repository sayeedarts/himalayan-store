/*!
 * Color mode toggler (Single button toggle)
 */

(() => {
    'use strict'

    const getStoredTheme = () => localStorage.getItem('theme')
    const setStoredTheme = theme => localStorage.setItem('theme', theme)

    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme()
        if (storedTheme) {
            return storedTheme
        }
        return 'light'
    }

    const setTheme = theme => {
        document.documentElement.setAttribute('data-bs-theme', theme)
    }

    setTheme(getPreferredTheme())

    const showActiveTheme = (theme) => {
        const themeSwitchers = document.querySelectorAll('.bd-theme')

        themeSwitchers.forEach(switcher => {
            const useElement = switcher.querySelector('svg use')
            // If current thread is light, show Sun (or Moon to indicate switch? Standard is usually showing current state or switch action. 
            // Bootstrap docs show current state icon.
            // Let's assume we show the icon of the *active* theme.

            if (theme === 'dark') {
                useElement.setAttribute('href', '#moon-stars-fill')
                switcher.setAttribute('aria-label', 'Switch to light theme')
            } else {
                useElement.setAttribute('href', '#sun-fill')
                switcher.setAttribute('aria-label', 'Switch to dark theme')
            }
        })
    }

    window.addEventListener('DOMContentLoaded', () => {
        const currentTheme = getPreferredTheme()
        showActiveTheme(currentTheme)

        document.querySelectorAll('.bd-theme')
            .forEach(toggle => {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault()
                    const current = document.documentElement.getAttribute('data-bs-theme')
                    const next = current === 'dark' ? 'light' : 'dark'

                    setStoredTheme(next)
                    setTheme(next)
                    showActiveTheme(next)
                })
            })
    })
})()
