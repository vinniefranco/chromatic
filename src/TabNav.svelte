<script>
	export let params = {};
	export let selected;

	let fretLink;
	let scaleLink;

	$: params && setLinks(params);

	function setLinks(params) {
		fretLink = `/#/fret/${params.tuning}`;

		if (selected == "scale") {
			scaleLink = `/#/scale/${params.tuning}/${params.key}/${params.scale}`;
		} else {
			scaleLink = `/#/scale/${params.tuning}/c/major-ionian`;
		}
	}

	setLinks(params);
</script>
<!-- This example requires Tailwind CSS v2.0+ -->
<div class="relative bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6">
    <div class="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
      <div class="flex justify-start lg:w-0 lg:flex-1">
        <a href="#">
          <span class="sr-only">Chromatic</span>
          <img class="h-8 w-auto sm:h-10" src="chromatic.svg" alt="">
        </a>
      </div>
      <div class="-mr-2 -my-2 md:hidden">
        <button type="button" class="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-expanded="false">
          <span class="sr-only">Open menu</span>
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <nav class="hidden md:flex space-x-10">
        <a href={fretLink} class="text-base font-medium text-gray-500 hover:text-gray-900">Fret Mode</a>
        <a href={scaleLink} class="text-base font-medium text-gray-500 hover:text-gray-900">Scale Mode </a>
      </nav>
    </div>
  </div>
</div>
