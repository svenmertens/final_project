document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const world_view = document.getElementById('world-view-id');
    const country_view = document.getElementById('country-view-id');

    toggleSwitch.addEventListener('change', function() {
        console.log(this);

        console.log(toggleSwitch);
        console.log(world_view);
        console.log(country_view);

        if (this.checked) {
            country_view.style.display = 'none';
            world_view.style.display = 'block';
        } else {
            country_view.style.display = 'block';
            world_view.style.display = 'none';
        }
    });
});