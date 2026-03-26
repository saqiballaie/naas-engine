<script>
  const inp = document.getElementById('main-search');
  const dd = document.getElementById('search-dropdown');

  if(inp) {
    inp.addEventListener('input', async () => {
      const val = inp.value.trim();
      if(val.length < 2) { 
        dd.style.display = 'none'; 
        return; 
      }

      try {
        const res = await fetch('/?ajax_search=' + encodeURIComponent(val));
        const data = await res.json();
        
        if(data.length > 0) {
          dd.innerHTML = data.map(item => `
            <div class="autocomplete-item" onclick="selectJournal('\${item.Name.replace(/'/g, "\\\\'")}')">
              <span style="display:block; font-weight:bold; color:var(--primary);">\${item.Name}</span>
              <small style="color:#666;">ISSN: \${item.ISSN}</small>
            </div>
          `).join('');
          dd.style.display = 'block';
        } else {
          dd.style.display = 'none';
        }
      } catch (err) {
        console.error('Autocomplete error:', err);
      }
    });
  }

  // Global function for the onclick event
  window.selectJournal = function(val) {
    inp.value = val;
    dd.style.display = 'none';
    // Optional: Automatically submit the form on selection
    // inp.form.submit();
  };

  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (e.target !== inp && e.target !== dd) dd.style.display = 'none';
  });
</script>
