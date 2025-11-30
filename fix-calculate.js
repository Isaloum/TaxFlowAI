    function calculate() {
      const data = getFormData();
      const income = data.source === 'RL-1' ? data.rl1.A : data.t4['14'];
      const unionDues = data.source === 'RL-1' ? data.rl1.F : data.t4['44'];
      const rrspAmount = parseFloat(document.getElementById('rrspInput').value) || 0;

      const rrsp = TaxCalculator.calculateRrspImpact(income, rrspAmount);
      const effectiveIncome = rrsp.newIncome;

      const solidarity = TaxCalculator.calculateSolidarityCredit(effectiveIncome);
      const workPremium = TaxCalculator.calculateWorkPremium(effectiveIncome);
      const cwb = TaxCalculator.calculateCWB(effectiveIncome);
      const bpaSavings = TaxCalculator.calculateBPA(effectiveIncome);

      const taxSaved = rrsp.taxSaved;
      const marginalRate = rrsp.marginalRate;

      const qcTotal = solidarity + workPremium;
      const fedTotal = bpaSavings + cwb;
      const totalBenefit = qcTotal + fedTotal + taxSaved;
      const cashBack = workPremium + cwb;

      let html = `<div class="result">
        <h3>${_('resultTitle')}</h3>
        <p><strong>${_('grossIncome')}: $${income.toLocaleString()}</strong></p>
        ${rrspAmount > 0 ? `<p>${_('afterRRSP')} ($${rrspAmount.toLocaleString()}): $${effectiveIncome.toLocaleString()}</p>` : ''}
        ${rrspAmount > 0 ? `<p>${_('taxSavings')} (${Math.round(marginalRate * 100)}%): $${taxSaved.toFixed(2)}</p>` : ''}
        <h4>${_('qcSection')}</h4>
        <p>${_('solidarityCredit')}: $${solidarity.toFixed(2)}</p>
        <p>${_('workPremium')}: $${workPremium.toFixed(2)}</p>
        <h4>${_('fedSection')}</h4>
        <p>${_('bpaSavings')}: $${bpaSavings.toFixed(2)}</p>
        <p>${_('cwb')}: $${cwb.toFixed(2)}</p>
        <hr>
        <p><strong>${_('totalBenefit')}: $${totalBenefit.toFixed(2)}</strong></p>
        <p style="font-size: 1.2em; color: #1890ff;"><strong>${_('cashRefund')}: $${cashBack.toFixed(2)}</strong></p>
      </div>`;

      const warnings = [];
      if (unionDues === null && income > 30000) {
        warnings.push(_('warningUnionDues'));
      }

      if (warnings.length > 0) {
        html += `<div class="warnings"><strong>${_('warnings')}</strong><ul>`;
        warnings.forEach(w => html += `<li>${w}</li>`);
        html += '</ul></div>';
      }

      document.getElementById('output').innerHTML = html;

      lastCalculationData = {
        ...data,
        analysis: {
          effectiveIncome,
          qcCredits: { solidarity, workPremium },
          fedCredits: { bpaSavings, cwb },
          rrspImpact: { contribution: rrspAmount, taxSaved, marginalRate }
        }
      };

      document.getElementById('exportBtn').style.display = document.getElementById('modeToggle').checked ? 'inline-block' : 'none';
      document.getElementById('jsonOutput').textContent = JSON.stringify(lastCalculationData, null, 2);
      document.getElementById('jsonOutput').style.display = 'none';
    }
