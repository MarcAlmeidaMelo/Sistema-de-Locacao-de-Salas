// =====================================================================
// CALENDAR.JS - CAJUHUB
// =====================================================================

class Calendar {
  constructor(elementId, options = {}) {
    this.element = document.getElementById(elementId);
    this.currentDate = new Date();
    this.selectedDate = null;
    this.bookedDates = options.bookedDates || [];
    this.onDateSelect = options.onDateSelect || null;
    this.minDate = options.minDate || new Date();
    this.maxDate = options.maxDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    this.render();
    this.attachEventListeners();
  }

  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let html = `
      <div class="calendar">
        <div class="calendar-header">
          <div style="font-size: 1.3rem; font-weight: 600;">
            ${this.getMonthName(month)} ${year}
          </div>
          <div class="calendar-nav">
            <button id="prev-month">← Anterior</button>
            <button id="next-month">Próximo →</button>
          </div>
        </div>

        <div class="calendar-weekdays">
          <div class="weekday">Dom</div>
          <div class="weekday">Seg</div>
          <div class="weekday">Ter</div>
          <div class="weekday">Qua</div>
          <div class="weekday">Qui</div>
          <div class="weekday">Sex</div>
          <div class="weekday">Sab</div>
        </div>

        <div class="calendar-days">
    `;

    // Dias do mês anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      html += `<div class="calendar-day other-month">${prevMonthLastDay - i}</div>`;
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = this.formatDateString(date);
      const isToday = this.isToday(date);
      const isBooked = this.isDateBooked(dateStr);
      const isDisabled = date < this.minDate || date > this.maxDate;
      const isSelected = this.selectedDate && this.formatDateString(this.selectedDate) === dateStr;

      let classes = 'calendar-day';
      if (isToday) classes += ' today';
      if (isBooked) classes += ' booked';
      if (isSelected) classes += ' selected';

      const onclick = isDisabled || isBooked ? '' : `onclick="this.calendar.selectDate(new Date(${date.getTime()}))"`;

      html += `<div class="calendar-day ${classes}" ${onclick} style="${isDisabled || isBooked ? 'cursor: not-allowed; opacity: 0.5;' : ''}">${day}</div>`;
    }

    // Dias do próximo mês
    const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;
    for (let day = 1; day <= totalCells - startingDayOfWeek - daysInMonth; day++) {
      html += `<div class="calendar-day other-month">${day}</div>`;
    }

    html += `
        </div>
      </div>
    `;

    this.element.innerHTML = html;

    // Adicionar referência ao calendário para os botões
    const calendarDays = this.element.querySelectorAll('.calendar-day');
    calendarDays.forEach(day => {
      day.calendar = this;
    });
  }

  attachEventListeners() {
    const prevBtn = this.element.querySelector('#prev-month');
    const nextBtn = this.element.querySelector('#next-month');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
        this.attachEventListeners();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
        this.attachEventListeners();
      });
    }
  }

  selectDate(date) {
    this.selectedDate = date;
    this.render();
    this.attachEventListeners();

    if (this.onDateSelect) {
      this.onDateSelect(this.formatDateString(date));
    }
  }

  formatDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isDateBooked(dateStr) {
    return this.bookedDates.includes(dateStr);
  }

  getMonthName(month) {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month];
  }

  setBookedDates(dates) {
    this.bookedDates = dates;
    this.render();
    this.attachEventListeners();
  }

  getSelectedDate() {
    return this.selectedDate ? this.formatDateString(this.selectedDate) : null;
  }
}

// =====================================================================
// INICIALIZAÇÃO DO CALENDÁRIO
// =====================================================================

function initializeCalendar(elementId, options = {}) {
  return new Calendar(elementId, options);
}
