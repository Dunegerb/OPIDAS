// --- CALENDAR COMPONENT LOGIC ---

function initCalendar(onDateSelectCallback) {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthYearEl = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');

    let currentDate = new Date();
    let selectedDate = new Date();

    const monthNamesFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function render() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        currentMonthYearEl.textContent = `${monthNamesFull[month]} ${year}`;
        calendarGrid.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

        // Days from the previous month
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        for (let i = dayOffset; i > 0; i--) {
            const dayEl = document.createElement('button');
            dayEl.className = 'calendar-day other-month';
            dayEl.textContent = daysInPrevMonth - i + 1;
            dayEl.disabled = true;
            calendarGrid.appendChild(dayEl);
        }

        // Days of the current month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('button');
            const thisDayDate = new Date(year, month, i);
            dayEl.className = 'calendar-day current-month';
            dayEl.textContent = i;
            
            if (thisDayDate > today) {
                dayEl.disabled = true;
                dayEl.classList.add('other-month');
            }

            if (thisDayDate.getTime() === selectedDate.getTime()) {
                dayEl.classList.add('selected');
            }

            dayEl.addEventListener('click', () => {
                if (!dayEl.disabled) {
                    selectedDate = thisDayDate;
                    onDateSelectCallback(selectedDate);
                    render();
                }
            });
            calendarGrid.appendChild(dayEl);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        render();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        render();
    });

    render();
}
