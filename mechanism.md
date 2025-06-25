# the mechanism to simulate the LEGv8 instruction set architecture
something like:
a PC() function that start to running the instruction,
fn PC(...data) {
    // the type 2 wait maybe detect here, in first every unit process
    if (step_mode) {
        // wait for user to press next step
        wait_for_user_to_press_next_step()
    }

    // the code that run data
    running_on_path_to_add4()               -|
                                             |-> these function should be run in parallelj
    running_on_path_to_instruction_memroy() -|

    // something here
    there is a wait here that for those path to finish there are 2 case of wait:
    // 1. wait because program being pause by user
    // 2. wait because this is run in step mode, mean program must will after every unit

    data_process = process-data(data)
    // calling those next units for there too process
    add4(data_process)                  -|
                                         |-> thse function should be run in parallel, and similar to this function it self
    instruction_memory(data_process)    -|
}

fn running_on_path_to_add4() {
    // a loop to render the animation of running on path
    // and this function suppose to have something in the middle of the loop to wait when user press pause
    while (end_of_path) {
        // render the animation of running on path
        render_animation_of_running_on_path()

        // wait for user to press pause or next step
        if (user_pressed_pause()) {
            wait_for_user_to_press_next_step()
        }
    }
}
