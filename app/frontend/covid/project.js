const Project = {
  initialize() {
    $(document).on('turbolinks:load', () => {
      console.log('loading')
      $('.not-accepting-volunteers').click(function(ev) {
        Project.notAcceptingVolunteers(this, ev);
      });

      $('.volunteer-with-skills').click(function(ev) {
        Project.volunteerWithSkills(this, ev);
      });

      $('.volunteer-without-skills').click(function(ev) {
        Project.volunteerWithoutSkills(this, ev);
      });
    });
  },

  notAcceptingVolunteers(that, ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const targetHref = $(that).attr('href');

    const headerHTML = "Karya ini tidak menerima sukarelawan";
    const bodyHTML = "Kami meminta maaf. Proyek ini telah mengindikasikan bahwa mereka memiliki semua sukarelawan yang butuhkan saat ini.";

    Covid.showModal(headerHTML, bodyHTML, [ { type: 'cancel', text: 'OK' } ], 'warning');

    return false;
  },

  volunteerWithSkills(that, ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const targetHref = $(that).attr('href');
    const skillsRequired = $(that).attr('x-skills-required').split(', ');
    const projectName = $(that).attr('x-project-name');
    const orgStatus = $(that).attr('x-org-status');

    let forProfitAlert = '';
    if (orgStatus == "For-profit") {
      forProfitAlert = `
      <div class="mt-3 text-xs">
        Siapbantu menyatakan bahwa relawan seharusnya tidak boleh memberikan layanan/perjuangan yang sama dengan karyawan yang <span class='text-orange-400'>ada di sektor for-profit</span>.<br/><br/>
        Diskusikan dengan tim karya tersebut sebelum melanjutkan secara sukarela.
      </div>
      `
    }

    const headerHTML = "Anda akan menjadi sukarelawan";
    const bodyHTML = `
      <span class="text-indigo-600">${projectName}</span> sedang mencari
      <br>
      ${Covid.skillBadges(skillsRequired, 'indigo')}
      <br>
      Apakah kamu yakin? Pemilik karya akan diberi tahu.<br><br>
      Tidak wajib, Kamu juga dapat mengirimi mereka pesan bagaimana kamu dapat berkontribusi pada salah satu peran ini
      <br>
      <div class="mt-3">
        <label for="volunteer_note" class="sr-only">Catatan sukarelawan</label>
        <div class="relative rounded-md shadow-sm">
          <input id="volunteer_note" class="form-input block w-full sm:text-sm sm:leading-5" placeholder="Dalam satu kalimat, mengapa Anda tertarik?" />
        </div>
      </div>

      ${forProfitAlert}
      `;

    const callback = () => {
      const volunteerNote = $("#volunteer_note").val();
      $.post(targetHref, { volunteer_note: volunteerNote });
    }

    Covid.showModal(headerHTML, bodyHTML, [ { type: 'cancel' }, { type: 'submit', text: 'Volunteer', callback } ], 'warning');

    return false;
  },

  volunteerWithoutSkills(that, ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const targetHref = $(that).attr('href');
    const skillsRequired = $(that).attr('x-skills-required');

    const headerHTML = "Skill tidak sesuai";
    const bodyHTML = `Sepertinya skill yang dibutuhkan untuk karya ini tidak sesuai dengan skill kamu. \n\nJika menurut kami ini salah, perbarui profil kamu dengan salah satu skill berikut: <b>${skillsRequired}</b>.`;

    const callback = () => window.location.href = targetHref;
    Covid.showModal(headerHTML, bodyHTML, [ { type: 'cancel' }, { type: 'submit', text: 'Edit Profile', callback } ], 'warning');

    return false;
  }
}

export default Project;
