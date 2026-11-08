/* timelines.js · alibi statements per case.
 * Row: [revealingSceneId, speaker, aboutWhom, start, end, place, text]
 * A row is added to the timeline when its scene is visited. Same `aboutWhom` + overlapping time + different `place` = contradiction.
 * Cases without an entry simply show no timeline. */
window.CF_TL = {
  manor: [
    ["c_kind", "Lady Celeste", "Lady Celeste", "22:40", "22:45", "Study", "Argued with Edmund about the will, then heard him lock the door."],
    ["c_kind", "Lady Celeste", "Victor", "22:50", "22:55", "Back stairs", "Saw Victor slipping down the back stairs."],
    ["v_key", "Victor", "Victor", "20:00", "20:10", "Study door", "Took the spare key to steal cash, then dumped it."],
    ["v_saw", "Victor", "Julian", "21:15", "21:20", "Pantry", "Saw Julian alone with the brandy decanter."],
    ["d_priv", "Mrs. Dsouza", "Julian", "21:20", "21:25", "Pantry", "Found Julian wiping the decanter stopper."],
    ["j_chat", "Julian", "Julian", "21:00", "22:30", "Library", "Claims he never went near the pantry."],
    ["j_chat", "Julian", "Dr. Mehta", "22:50", "22:55", "Library", "Says Mehta left the library at 10:50."],
    ["m_confess", "Dr. Mehta", "Julian", "21:00", "21:05", "Guest wing", "Handed Julian a digoxin vial at 9 PM."],
    ["m_confess", "Dr. Mehta", "Dr. Mehta", "22:50", "22:55", "Hall clock", "Found Edmund dead and stopped the clock."]
  ],
  key: [
    ["p_kind", "Pooja", "Spare key", "15:00", "17:00", "With Verma", "Lent the spare staff room key to Verma."],
    ["bins", "Copy shop receipt", "Verma", "16:15", "16:20", "Copy shop", "14 pages copied, signed V."],
    ["v_chat", "Verma", "Verma", "16:00", "16:30", "Parents' meeting", "Says he left the staff room unlocked for a meeting."],
    ["i_mail", "Mrs. Iyer", "Mrs. Iyer", "18:00", "18:30", "Home", "Left at 6 PM and went straight home."],
    ["cctv", "CCTV log", "Verma", "21:00", "21:05", "School", "Corridor camera switched off with the HOD login."],
    ["gate", "Gate register", "Verma", "21:40", "21:55", "School", "Logged back in at 9:40 PM."],
    ["v_bluff", "Verma", "Verma", "21:40", "21:55", "Home", "Claims he was at home."]
  ],
  wedding: [
    ["a_ask", "Aunt Vimala", "Aunt Vimala", "19:30", "20:15", "Kitchen", "In the kitchen with six cooks as witnesses."],
    ["p_chat", "Meenal", "Meenal", "19:45", "20:15", "Main hall", "Claims she never left the main hall during dinner."],
    ["r_chat", "Arjun", "Meenal's tote", "19:55", "20:00", "Jewellery room door", "Saw the tote hanging by the door."],
    ["z_nice", "Zoya's photo", "Meenal", "19:55", "20:00", "Jewellery room corridor", "Meenal at the door with a bulging tote."]
  ],
  violin: [
    ["t_kind", "Tanvi", "Mr. Sequeira", "16:00", "16:10", "Green room", "Locked the case with his master key."],
    ["g_ask", "Gita", "Mr. Sequeira", "16:50", "17:00", "Loading dock", "Wheeled a cart under a blue cloth to the dock."],
    ["dock", "Dock register", "Aurora violin", "17:10", "17:15", "Loading dock", "Collected \"for repair\", signed S."]
  ],
  arctic: [
    ["r_ask", "Rosa", "Rosa", "00:00", "04:00", "Medical bay", "With Tomas, who had a fever."],
    ["t_ask", "Tomas", "Heavy boots", "02:55", "03:00", "Past the bunks", "Stomped toward the generator room."],
    ["l_ask", "Lena", "Lena", "03:00", "03:05", "Bunk", "In her bunk when the power failed."],
    ["c_ask", "Chidi", "Chidi", "03:00", "03:10", "Sample freezer", "Checking samples when the lights died."],
    ["lock", "Lock log", "Lab lock", "03:02", "03:06", "Fail-open", "Reset for four minutes, needs the override."],
    ["c_ask", "Chidi", "Flashlight", "03:10", "03:15", "Path to engine shed", "Saw a beam cross the snow."]
  ],
  starship: [
    ["orin", "ORIN backup", "Dr. Petrov", "01:58", "02:00", "ORIN console", "Put ORIN in diagnostic mode."],
    ["p_air", "Log", "Dr. Petrov", "02:14", "02:15", "Science bay", "The only officer in the science bay."],
    ["airlock", "Airlock log", "Outer airlock", "02:14", "02:15", "Cycled", "Maintenance clearance used."],
    ["j_ask", "Jax", "Jax", "02:14", "02:20", "Coolant pump", "Fixing a pump when the airlock cycled."],
    ["b_ask", "Bo", "Dr. Petrov", "02:20", "02:25", "Toward cargo bay three", "Carried a cryo-case."]
  ]
};
