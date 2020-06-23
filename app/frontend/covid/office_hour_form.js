import moment from 'moment';
import flatpickr from 'flatpickr';

const dateOpts = {
  altInput: true,
  altFormat: 'F j, Y',
  dateFormat: 'Y-m-d',
  minDate: new Date(),
};

const timeOpts = {
  enableTime: true,
  noCalendar: true,
  dateFormat: "H:i",
  defaultHour: 10,
  defaultMinute: 0,
  minuteIncrement: 10,
};

const OfficeHourForm = {
  initialize() {
    $(document).on('turbolinks:load', () => {
      if ($('.office-hour-form').length > 0) {
        $('body').on('click', '.add-office-hour-slot', function (e) {
          OfficeHourForm.addOfficeHourSlot(e);
        });

        $('body').on('click', '.delete-oh-slot', function (e) {
          OfficeHourForm.deleteOfficeHourSlot(e, this);
        });

        $('body').on('click', '.remove-office-hour-slot', function (e) {
          OfficeHourForm.removeOfficeHourSlot(e, this);
        });

        $('body').on('click', '.create-office-hour-slots', function (e) {
          OfficeHourForm.createOfficeHourSlots(e);
        });

        $('body').on('click', '.cancel-office-hour-slots', function (e) {
          window.location = '/office_hours';
        });

        $('body').on('click', '.oh-edit-action', function (e) {
          OfficeHourForm.showOHAction(e, this);
        });

        OfficeHourForm.setupFlatpickr();
      }

    }).on('turbolinks:before-cache', function () {
      if ($('.office-hour-form').length > 0) {
        OfficeHourForm.removeFlatpickr();
      }
    });
  },

  addOfficeHourSlot(e) {
    e.preventDefault();

    OfficeHourForm.removeFlatpickr();

    const slotForm = $('.office-hour-form-template').first().clone();

    $(slotForm).find('.office-hour-date').val('');
    $(slotForm).find('.office-hour-time').val('');
    $(slotForm).find('.office-hour-slot-errors').text('');
    $(slotForm).find('.remove-office-hour-slot').removeClass('hidden');

    $(slotForm).addClass('mt-6');
    $('.office-hour-form').append(slotForm);

    OfficeHourForm.setupFlatpickr();

    // Try to be smart about picking the next time.
    OfficeHourForm.guessNextSlot();

    return false;
  },

  guessNextSlot() {
    const allSlotForms = $('.office-hour-form-template').toArray();
    const newSlotForm = allSlotForms.pop();
    const lastSlotForm = allSlotForms.pop();

    const length = $(newSlotForm).find('.office-hour-length').val();

    const lastSlotDates = OfficeHourForm.slotStartAndEndDate(lastSlotForm);
    if (!lastSlotDates) {
      return;
    }

    let newStartDate = lastSlotDates[1];
    let newEndDate = OfficeHourForm.addLengthToDate(length, newStartDate);

    const dateObj = $(newSlotForm).find('.office-hour-date:hidden').last()[0]._flatpickr;
    dateObj.setDate(newStartDate);

    const timeObj = $(newSlotForm).find('.office-hour-time').last()[0]._flatpickr;
    timeObj.setDate(newStartDate);
  },

  deleteOfficeHourSlot(e, that) {
    const OHId = $(that).attr('x-id');
    const when = $(that).attr('x-when');

    const deleteCallback = () => {
      $.ajax({
        url: `/office_hours/${OHId}`,
        type: 'DELETE',
      });
    }

    const modalActions =  [ { type: 'danger', text: 'Delete slot', callback: deleteCallback }, { type: 'cancel' } ];
    const headerHTML = `Delete ${when} Office Hour`;
    const bodyHTML = `
      Are you sure you want to delete your <span class="text-indigo-600">${when}</span> slot?
    `;

    Covid.showModal(headerHTML, bodyHTML, modalActions, 'warning');
  },

  removeOfficeHourSlot(e, that) {
    $(that).parents('.office-hour-form-template').remove();
  },

  removeFlatpickr() {
    $('.office-hour-date').each(function() {
      const parent = $(this).parent();
      const date = $(this).val();
      flatpickr(this).destroy();
      $(parent).find('.office-hour-date').val(date);
    });

    $('.office-hour-time').each(function() {
      const parent = $(this).parent();
      const time = $(this).val();
      flatpickr(this).destroy();
      $(parent).find('.office-hour-time').val(time);
    });
  },

  setupFlatpickr() {
    $('.office-hour-date').each(function() {
      const date = $(this).val();
      const dateObj = flatpickr(this, dateOpts);
      dateObj.setDate(date, dateOpts.dateFormat);
    });

    $('.office-hour-time').each(function() {
      const time = $(this).val();
      const timeObj = flatpickr(this, timeOpts);
      timeObj.setDate(time, timeOpts.dateFormat);
    });
  },

  createOfficeHourSlots(e) {
    e.preventDefault();

    $('.office-hour-slot-errors').text('');
    $('.office-hour-description-error').text('').hide();

    const description = $('#description').val();

    if (!description) {
      $('.office-hour-description-error').text("We're sorry, can you please add a description for the OH?").show();
      return;
    }

    if (description.length > 160) {
      $('.office-hour-description-error').text("We're sorry, you can enter a maximum of 160 characters.").show();
      return;
    }

    const slots = $('.office-hour-form-template');

    let allDates = [];

    for (const slot of slots) {
      const dates = OfficeHourForm.slotStartAndEndDate(slot);

      if (!dates) {
        $(slot).find('.office-hour-slot-errors').text('Please enter a date and a time.');
        continue;
      }

      if (moment().isAfter(dates[0])) {
        $(slot).find('.office-hour-slot-errors').text('Oops, it seems like this slot is in the past.');
        continue;
      }

      allDates = [].concat(allDates, dates);
    }

    if (OfficeHourForm.doDatesOverlap(allDates)) {
      $('.office-hour-slot-errors').first().text("We're sorry, it seems like the dates overlap.");
      return false;
    }

    $.post('/office_hours', { office_hour_dates: allDates, description });
    return false;
  },

  slotStartAndEndDate(slotForm) {
    const dates = [];

    const date = $(slotForm).find('.office-hour-date').val();
    const time = $(slotForm).find('.office-hour-time').val();
    const length = $(slotForm).find('.office-hour-length').val();

    if (!date || !time || !length) {
      return null;
    }

    const parsedStartDate = flatpickr.parseDate(`${date} ${time}`, `${dateOpts.dateFormat} ${timeOpts.dateFormat}`);

    dates.push(parsedStartDate);
    let parsedEndDate = OfficeHourForm.addLengthToDate(length, parsedStartDate);

    dates.push(parsedEndDate);

    return dates;
  },

  addLengthToDate(length, date) {
    let parsedEndDate = null;
    if (length == '10m') {
      parsedEndDate = moment(date).add(10, 'minutes').toDate();
    } else if (length == '20m') {
      parsedEndDate = moment(date).add(20, 'minutes').toDate();
    } else if (length == '30m') {
      parsedEndDate = moment(date).add(30, 'minutes').toDate();
    }
    return parsedEndDate;
  },

  doDatesOverlap(dates) {
    if (dates.length % 2 !== 0) {
      return true;
    }

    for (let i = 0; i < dates.length - 2; i += 2) {
      for (let j = i + 2; j < dates.length; j += 2) {
        if (OfficeHourForm.dateRangeOverlaps(dates[i], dates[i+1], dates[j], dates[j+1])) {
          return true;
        }
      }
    }
    return false;
  },

  dateRangeOverlaps(a_start, a_end, b_start, b_end) {
    if (a_start < b_start  && b_start < a_end) return true; // b starts in a
    if (a_start < b_end    && b_end   < a_end) return true; // b ends in a
    if (b_start < a_start  && a_end   < b_end) return true; // a in b
    return false;
  },

  showOHAction(e, that) {
    const participant = JSON.parse($(that).attr('x-participant'));

    if (participant && participant.name) {
      OfficeHourForm.showOHParticipant(that);
    } else {
      OfficeHourForm.showOHVolunteers(that);
    }
  },

  showOHParticipant(that) {
    const OHId = $(that).attr('x-id');
    const when = $(that).attr('x-when');
    const participant = JSON.parse($(that).attr('x-participant'));

    const headerHTML = `${when} Office Hour`;
    const bodyHTML = `
      <br/>You have accepted:<br/><span class='text-indigo-600'>${participant.name}</span> / <span class='text-indigo-600'>${participant.email}</span>
      `;

    Covid.showModal(headerHTML, bodyHTML, [ { type: 'cancel', text: 'Close' } ], 'warning');
  },

  showOHVolunteers(that) {
    const OHId = $(that).attr('x-id');
    const when = $(that).attr('x-when');
    const volunteers = JSON.parse($(that).attr('x-volunteers'));

    const acceptCallback = () => {
      const acceptedUserId = $('input[name="applicant_id"]:checked').val();

      if (!acceptedUserId) {
        alert("Please choose an applicant.");
        return;
      }

      $.ajax({
        url: `/office_hours/${OHId}/accept?accepted_user_id=${acceptedUserId}`,
        type: 'POST',
      });
    }

    const deleteCallback = () => {
      $.ajax({
        url: `/office_hours/${OHId}`,
        type: 'DELETE',
      });
    }

    const modalActions =  [ { type: 'danger', text: 'Delete slot', callback: deleteCallback }, { type: 'cancel' } ];
    let volunteerHTML = '';

    if (volunteers.length > 0) {
      volunteerHTML += "Below are the people that applied for this slot:<br/>";

      for (const volunteer of volunteers) {
        let projectsHTML = '';
        for (const project of volunteer.projects) {
          projectsHTML += `
            <div class="sm:flex sm:justify-between">
              <div class="ml-7 flex items-center text-sm leading-5 text-gray-500">
                -&nbsp;&nbsp;<a href="/projects/${project.id}" target="_blank" class="hover:underline">${project.name}</a>
              </div>
            </div>`;
        }

        volunteerHTML += `
          <ul class="mt-2">
            <li>
              <div class="mb-2">
                <div class="flex items-center justify-between">
                  <div class="text-sm leading-5 font-medium text-indigo-600 truncate">
                    <input name="applicant_id" value="${volunteer.id}" type="radio" class="form-radio inline-block mr-2 h-4 w-4 text-indigo-600 transition duration-150 ease-in-out" />
                    <a href="/users/${volunteer.id}" target="_blank" class="hover:underline">
                      ${volunteer.name}
                    </a>
                  </div>
                </div>
                ${projectsHTML}
              </div>
            </li>
          </ul>

          <div class="mt-2">
            Once you accept someone you'll both receive a call invite.
          </div>
        `;
      }

      modalActions.push( { type: 'submit', text: 'Accept', callback: acceptCallback });
    } else {
      volunteerHTML = 'Nobody has applied yet.';
    }

    const headerHTML = `${when} Office Hour`;
    const bodyHTML = `
      You have a slot at <span class="text-indigo-600">${when}</span>.
      <br>
      <br>
      ${volunteerHTML}
    `;

    Covid.showModal(headerHTML, bodyHTML, modalActions, 'warning');
  },

}

export default OfficeHourForm;
