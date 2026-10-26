# 10 · Manage the budget

Parties have a way of costing more than planned. This video shows how Giddy keeps the budget in view, from what's planned and paid to the parent's own costs, and how it helps when the plan goes over.

## What the budget promises

The budget is a view of the plan, so it stays up to date without the parent typing anything in. When a vendor sends a quote or a booking takes a deposit, the item's status and amounts change by themselves. Every price is in Canadian dollars with thirteen percent HST included, and the page says so once. And if the plan goes over, Giddy suggests a concrete swap that gets it back within budget.

## Tracking and adding costs

Here is the budget for Zuri's Dino Dig on a laptop. Seven hundred and seventy-eight dollars is planned of eight hundred, a hundred dollars is paid, and that works out to forty-nine dollars a kid. The bar has a coloured segment for each category, and the legend names each one with its amount, so colour is never the only clue. The table shows every item with its status: the venue's deposit is paid, and the rest are still estimates. Amara adds a cost of her own: dino balloons and a banner for twenty-two dollars. Before she saves, the dialog tells her she'll have nothing left of her eight hundred dollar budget. She marks it as already paid and adds it, and the totals update straight away. Her own costs can be changed or removed at any time; here she lowers it to fifteen dollars.

## When there are no costs

A party with nothing planned yet starts empty. Giddy can fill in typical Toronto costs from the plan in one tap, or the parent can add a cost themselves.

## Amounts that don't add up

An amount has to be a positive number with at most two decimals. Anything else gets a clear message in the dialog: enter an amount like thirty-five or thirty-five fifty.

## Getting back within budget

On a phone, a forty-dollar balloon arch has pushed the plan eighteen dollars over. The warning says so, the badge reads eighteen dollars over, and the bar is outlined in red. Giddy found a cheaper entertainer who is free on the party date: Rexy the Dino Visit for a hundred and fifty dollars instead of Professor Fizz at a hundred and ninety-five, saving forty-five. Amara taps the swap, confirms it, and the plan and the budget update together. The warning disappears and she's back within budget with twenty-seven dollars left. If no swap feels right, Talk it through opens a conversation with Giddy.

## How it is tested

The API tests cover the totals and categories, statuses from quotes and deposits, adding, changing and removing costs, the amount rule, Giddy's estimates, the swap that brings the plan back within budget, and that viewers can see the budget but not change it. The browser tests drive the same flows against the fake API at phone and desktop widths, with accessibility checks on the page and in the dialog.

## Recap

Things to remember. The budget is a view of the plan, so quotes and deposits show up by themselves. The dialog previews what's left before you save. Your own costs can be changed or removed. And when the plan goes over, Giddy offers a swap that fits. Next, parents work through the party checklist.
