"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const positionsData = [
      // Level 1
      {
        ref: "DANSATLAK",
        position: "DANSATLAK DUKTEKSI",
        parentRef: null,
        color: "merah",
      },

      // Level 2
      {
        ref: "SPACER_KIRI",
        position: "_EMPTY_",
        parentRef: "DANSATLAK",
        color: "teal",
      },
      {
        ref: "KABAGOPS",
        position: "KABAGOPS",
        parentRef: "DANSATLAK",
        color: "teal",
      },
      {
        ref: "TRUNK_1",
        position: "_TRUNK_",
        parentRef: "DANSATLAK",
        color: "teal",
      },
      {
        ref: "KABAGMIN",
        position: "KABAGMIN",
        parentRef: "DANSATLAK",
        color: "teal",
      },
      {
        ref: "SPACER_BATIMIN",
        position: "_SPACER_BATIMIN_",
        parentRef: "DANSATLAK",
        color: "teal",
      },

      // Level 3
      {
        ref: "PAUROPS",
        position: "PAUROPS",
        parentRef: "KABAGOPS",
        color: "teal",
      },
      {
        ref: "TRUNK_2",
        position: "_TRUNK_",
        parentRef: "TRUNK_1",
        color: "teal",
      },
      {
        ref: "PAURMIN",
        position: "PAURMIN",
        parentRef: "KABAGMIN",
        color: "teal",
      },
      {
        ref: "BATIMIN",
        position: "BATIMIN",
        parentRef: "SPACER_BATIMIN",
        color: "teal",
      },

      // Level 4
      {
        ref: "BAMIN_BAGOPS",
        position: "BAMIN BAGOPS",
        parentRef: "PAUROPS",
        color: "teal",
      },
      {
        ref: "TRUNK_3",
        position: "_TRUNK_",
        parentRef: "TRUNK_2",
        color: "teal",
      },
      {
        ref: "BAMIN_BAGMIN",
        position: "BAMIN BAGMIN",
        parentRef: "PAURMIN",
        color: "teal",
      },
      {
        ref: "TAMUDI",
        position: "TAMUDI",
        parentRef: "BATIMIN",
        color: "teal",
      },

      // Level 5 (DANTIM)
      {
        ref: "DANTIM_BANGTEKSI",
        position: "DANTIMBANGTEKSI",
        parentRef: "TRUNK_3",
        color: "teal",
      },
      {
        ref: "DANTIM_RT",
        position: "DANTIM REKAYASA TERBALIK",
        parentRef: "TRUNK_3",
        color: "teal",
      },
      {
        ref: "DANTIM_HARWAT",
        position: "DANTIM HARWATSTAL",
        parentRef: "TRUNK_3",
        color: "teal",
      },

      // Level 6 (Spacer Penata & Danunit)
      {
        ref: "SPACER_PENATA_DIG",
        position: "_SPACER_PENATA_",
        parentRef: "DANTIM_BANGTEKSI",
        color: "teal",
      },
      {
        ref: "DANUNIT_QA",
        position: "DANUNIT BAG QUANTUM DAN AI",
        parentRef: "DANTIM_BANGTEKSI",
        color: "teal",
      },
      {
        ref: "DANUNIT_KOM",
        position: "DANUNIT KOM KEAMANAN DIG",
        parentRef: "DANTIM_BANGTEKSI",
        color: "teal",
      },

      {
        ref: "SPACER_PENATA_APP",
        position: "_SPACER_PENATA_",
        parentRef: "DANTIM_RT",
        color: "teal",
      },
      {
        ref: "DANUNIT_IOT",
        position: "DANUNIT REKAYASA IOT",
        parentRef: "DANTIM_RT",
        color: "teal",
      },
      {
        ref: "DANUNIT_RPL",
        position: "DANUNIT REKAYASA PERANGKAT LUNAK",
        parentRef: "DANTIM_RT",
        color: "teal",
      },

      {
        ref: "SPACER_PENATA_SERVER",
        position: "_SPACER_PENATA_",  
        parentRef: "DANTIM_HARWAT",
        color: "teal",
      },
      {
        ref: "DANUNIT_HW",
        position: "DANUNIT HARWAT HARDWARE",
        parentRef: "DANTIM_HARWAT",
        color: "teal",
      },
      {
        ref: "DANUNIT_SW",
        position: "DANUNIT HARWAT SOFTWARE",
        parentRef: "DANTIM_HARWAT",
        color: "teal",
      },

      // Level 7 (Penata & Paunit)
      {
        ref: "PENATA_DIG",
        position: "PENATA ADMIN DAN ANALIS DIG",
        parentRef: "SPACER_PENATA_DIG",
        color: "teal",
      },
      {
        ref: "PENATA_APP",
        position: "PENATA PENILAIAN KEAMANAN SISTEM DAN APLIKASI",
        parentRef: "SPACER_PENATA_APP",
        color: "teal",
      },
      {
        ref: "PENATA_SERVER",
        position: "PENATA INSTALASI SISTEM DAN SERVER",
        parentRef: "SPACER_PENATA_SERVER",
        color: "teal",
      },

      {
        ref: "PAUNIT_AI",
        position: "PAUNIT KECERDASAN BUATAN",
        parentRef: "DANUNIT_QA",
        color: "teal",
      },
      {
        ref: "PAUNIT_BQ",
        position: "PAUNIT BANG BQ",
        parentRef: "DANUNIT_QA",
        color: "teal",
      },
      // --- PERBAIKAN: Pindah ke DANUNIT_KOM ---
      {
        ref: "PAUNIT_DATA",
        position: "PAUNIT PEMULIHAN DATA",
        parentRef: "DANUNIT_KOM",
        color: "teal",
      },
      {
        ref: "PAUNIT_KONTRA",
        position: "PAUNIT KONTRA PENGINDRAAN",
        parentRef: "DANUNIT_KOM",
        color: "teal",
      },
      // ----------------------------------------
      {
        ref: "PAUNIT_KEAM_IOT",
        position: "PAUNIT KEAMANAN SI IOT",
        parentRef: "DANUNIT_IOT",
        color: "teal",
      },
      {
        ref: "PAUNIT_REKON",
        position: "PAUNIT REKONTRUKSI SISTEM",
        parentRef: "DANUNIT_RPL",
        color: "teal",
      },
      {
        ref: "PAUNIT_HW",
        position: "PAUNIT HARWAT PERANGKAT KERAS",
        parentRef: "DANUNIT_HW",
        color: "teal",
      },
      {
        ref: "PAUNIT_SW",
        position: "PAUNIT HARWAT PERANGKAT LUNAK",
        parentRef: "DANUNIT_SW",
        color: "teal",
      },

      // Level 8 & 9 (Baur & Ba)
      {
        ref: "BAUR_AI",
        position: "BAUR KECERDASAN BUATAN",
        parentRef: "PAUNIT_AI",
        color: "teal",
      },
      {
        ref: "BAUR_DATA",
        position: "BAUR PEMULIHAN DATA",
        parentRef: "PAUNIT_DATA",
        color: "teal",
      }, // Otomatis ikut karena parent-nya pindah
      {
        ref: "BAUR_KONTRA",
        position: "BAUR KONTRA PENGINDRAAN",
        parentRef: "PAUNIT_KONTRA",
        color: "teal",
      },
      {
        ref: "BAUR_KEAM_IOT",
        position: "BAUR KEAMANAN SI IOT",
        parentRef: "PAUNIT_KEAM_IOT",
        color: "teal",
      },
      {
        ref: "BAUR_REKON",
        position: "BAUR REKONTRUKSI SISTEM",
        parentRef: "PAUNIT_REKON",
        color: "teal",
      },
      {
        ref: "BAUR_HAR_HW",
        position: "BAUR HAR PERANGKAT KERAS",
        parentRef: "PAUNIT_HW",
        color: "teal",
      },
      {
        ref: "BA_WAT_HW",
        position: "BA WAT PERANGKAT KERAS",
        parentRef: "BAUR_HAR_HW",
        color: "teal",
      },
      {
        ref: "BAUR_HARWAT_SW",
        position: "BAUR HARWAT PERANGKAT LUNAK",
        parentRef: "PAUNIT_SW",
        color: "teal",
      },
    ];

    const positions = positionsData.map((p, index) => ({
      ...p,
      order: index + 1,
    }));

    const timestamp = new Date();
    let resolvedMap = { null: null };
    let pending = [...positions];

    while (pending.length > 0) {
      let progressMade = false;
      for (let i = 0; i < pending.length; i++) {
        const item = pending[i];
        if (resolvedMap[item.parentRef] !== undefined) {
          const [results] = await queryInterface.sequelize.query(
            `INSERT INTO org_structures (name, position, rank, photo, parent_id, display_order, box_color, admin_id, created_at, updated_at) 
             VALUES (:name, :position, :rank, :photo, :parent_id, :display_order, :box_color, :admin_id, :created_at, :updated_at) 
             RETURNING id;`,
            {
              replacements: {
                name: "",
                position: item.position,
                rank: null,
                photo: null,
                parent_id: resolvedMap[item.parentRef],
                display_order: item.order,
                box_color: item.color,
                admin_id: null,
                created_at: timestamp,
                updated_at: timestamp,
              },
            },
          );
          resolvedMap[item.ref] = results[0].id;
          pending.splice(i, 1);
          i--;
          progressMade = true;
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("org_structures", null, {});
  },
};
