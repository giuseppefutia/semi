# Basic implementation from: https://discuss.pytorch.org/t/easiest-way-to-draw-training-validation-loss/13195/9

from datetime import datetime
import visdom


class VisManger:
    def __init__(self, env_name=None):
        if env_name is None:
            env_name = str(datetime.now().strftime("%d-%m %Hh%M"))
        self.env_name = env_name
        self.vis = visdom.Visdom(env=self.env_name)
        self.loss_win = None

    def plot_loss(self, loss, step):
        self.loss_win = self.vis.line(
            [loss],
            [step],
            win=self.loss_win,
            update='append' if self.loss_win else None,
            opts=dict(
                xlabel='Epoch',
                ylabel='Loss',
                title='Loss (for each epoch)',
            )
        )

    def plot_rank(self, ranks, number_of_triples):
        self.rank_win = self.vis.bar(
            X=number_of_triples,
            opts=dict(
                xlabel='Rank',
                ylabel='Number of triples',
                title='Number of triples (for each rank)',
                rownames=ranks,
                stacked=True
            )
        )
