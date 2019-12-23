(function() {
  let pageList = [];

  // Hepler function to fetch jokes
  async function fetchData(query= '') {
    const url = `http://api.icndb.com/${query}`
    const response = await fetch(url);
    return await response.json();
  }

  // Helper functions for app
  function getPaginationRange(currentPage, numberPerPage) {
    const begin = ((currentPage - 1) * numberPerPage);
    return {
      begin,
      end: begin + numberPerPage
    }
  };

  function renderJokesList(currentJokesData, pageList) {
    let listSelector = document.querySelector(".jokes-list");
    let countSelector = document.querySelector(".total-count");

    listSelector.innerHTML = "";
    countSelector.innerHTML = currentJokesData.length;

    buildJokeMarkup(listSelector, pageList);
  }

  function buildJokeMarkup(listSelector) {
    for (i = 0; i < pageList.length; i++) {
      listSelector.innerHTML += `<li>${pageList[i].joke}</li>`;
    }
  }

  function buildJokesPage(currentJokesData, currentPage, numberPerPage) {
    const { begin, end } = getPaginationRange(currentPage, numberPerPage);

    pageList = currentJokesData.slice(begin, end);

    renderJokesList(currentJokesData, pageList);
  }

  async function loadJokeResultsPage() {
    const fetchedData = await fetchData("jokes");
    const fetchedCategories = await fetchData("categories");
    const fetchedJokesData = fetchedData.value;

    // Cache the original fetched joke list
    let originalJokesData = [...fetchedJokesData];

    const numberPerPage = 10; //configure to how many jokes you want per page

    let state = {
      currentJokesData: originalJokesData,
      currentPage: 1,
      numberPerPage, 
      numberOfPages: getNumberOfPages(originalJokesData, numberPerPage)
    }

    // Jokes Page Heleprs
    function renderJokeCategories() {
      let categorySelector = document.querySelector(".joke-filters");
      categorySelector.innerHTML = "<option value selected disabled>Choose a filter</option>";
      fetchedCategories.value.map(category => {
          categorySelector.innerHTML += `<option value="${category}">${category}</option>`;
      })
    }

    function getNumberOfPages(currentJokesData, numberPerPage) {
      return Math.ceil(currentJokesData.length / numberPerPage);
    }

    function updateJokesPage() {
      const { currentJokesData, currentPage, numberPerPage } = state;
      buildJokesPage(currentJokesData, currentPage, numberPerPage);
      handlePaginationState();
    }

    function resetJokeList(newJokes) {
      state.currentJokesData = [...newJokes];

      const { currentJokesData, numberPerPage } = state;

      // reset pagination
      state.currentPage = 1;

      state.numberOfPages = getNumberOfPages(currentJokesData, numberPerPage);
    }

    async function fetchFilteredJokes(value) {
      const filteredJokes = await fetchData(`jokes?limitTo=[${value}]`);
      resetJokeList(filteredJokes.value);
      updateJokesPage();
    }

    function randomizeJokes() {
      const newJokesData = originalJokesData;
      const randomJokes = newJokesData.sort(() => Math.random() - 0.5);
      resetJokeList(randomJokes);
      updateJokesPage();
    }

    function sortJokes() {
      const newJokesData = originalJokesData;
      const sortedJokes = newJokesData.sort((a, b) => a.joke.localeCompare(b.joke));
      resetJokeList(sortedJokes);
      updateJokesPage();
    }

    // Pagination
    function handlePaginationState() {
      const { currentPage, numberOfPages } = state;
      document.querySelector(".prev-page").disabled = currentPage == 1 ? true : false;
      document.querySelector(".next-page").disabled = currentPage == numberOfPages ? true : false;
    }

    function onNextPage() {
      state.currentPage += 1;
      updateJokesPage();
    }

    function onPrevPage() {
      state.currentPage -= 1;
      updateJokesPage();
    }

    // Bind Page events
    document.querySelector(".randomize-jokes").addEventListener("click", function() {
      randomizeJokes();
    });

    document.querySelector(".joke-filters").onchange = function () {
      const value = this.value;
      fetchFilteredJokes(value);
    }

    document.querySelector(".sort-jokes").addEventListener("click", function() {
      sortJokes();
    });

    document.querySelector(".next-page").addEventListener("click", function() {
      onNextPage();
    });

    document.querySelector(".prev-page").addEventListener("click", function() {
      onPrevPage();
    });

    updateJokesPage();
    renderJokeCategories();
  }

  // Kick off app
  loadJokeResultsPage();
})();
